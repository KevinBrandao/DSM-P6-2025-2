import asyncio
import json
import logging
import os
import signal

import joblib
import numpy as np
import pandas as pd
import nats
from nats.js import JetStreamContext
# CORREÇÃO: Importar StreamConfig para definir a configuração do stream
from nats.js.api import ConsumerConfig, AckPolicy, StreamConfig, RetentionPolicy

# --- (Configuração de Logging e Constantes permanecem as mesmas) ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
NATS_URL = os.getenv("NATS_URL", "nats://localhost:4222")
MODEL_PATH = os.getenv("MODEL_PATH", "./heart_disease_full_pipeline.joblib")
STREAM_ANALYSES = "ANALYSES"
SUBJECT_ANALYSES_REQUEST = "analyses.request"
STREAM_RESULTS = "RESULTS"
SUBJECT_RESULTS_COMPLETED = "results.completed"
DURABLE_NAME = "ia-analysis-processor"


class AnalysisService:
    # --- (A classe AnalysisService permanece inalterada) ---
    def __init__(self, model_path: str):
        self.model = None
        self.model_path = model_path
        self.all_columns = [
            'age', 'resting bp s', 'cholesterol', 'max heart rate', 'oldpeak',
            'sex', 'chest pain type', 'fasting blood sugar', 'resting ecg',
            'exercise angina', 'ST slope'
        ]

    def load_model(self):
        try:
            self.model = joblib.load(self.model_path)
            logger.info(f"Modelo de IA carregado com sucesso de '{self.model_path}'.")
        except FileNotFoundError:
            logger.error(f"Erro crítico: Arquivo do modelo não encontrado em '{self.model_path}'.")
            raise
        except Exception as e:
            logger.error(f"Erro crítico ao carregar o modelo: {e}")
            raise

    def predict(self, input_data: list) -> int:
        if not self.model:
            raise RuntimeError("O modelo de IA não foi carregado.")
        
        df = pd.DataFrame([input_data], columns=self.all_columns)

        previsao = self.model.predict(df)
        return int(previsao[0])


class NatsConsumer:
    def __init__(self, analysis_service: AnalysisService):
        self.analysis_service = analysis_service
        self.shutdown_event = asyncio.Event()

    async def run(self):
        nc = None
        sub = None
        
        try:
            logger.info(f"Tentando conectar ao NATS em {NATS_URL}...")
            nc = await nats.connect(
                servers=[NATS_URL],
                reconnect_time_wait=5,
                error_cb=self.on_error,
            )

            if nc is None or not nc.is_connected:
                logger.error("Falha ao conectar ao NATS. O serviço será encerrado.")
                return

            logger.info(f"Conexão NATS estabelecida (is_connected: {nc.is_connected}).")

            js = nc.jetstream()
            logger.info("Contexto JetStream obtido.")

            # **CORREÇÃO: Usar 'update_stream' em vez de 'add_stream'**
            # E definir a configuração explicitamente para garantir consistência.
            
            # Configuração para o stream ANALYSES (Work Queue)
            analyses_config = StreamConfig(
                name=STREAM_ANALYSES,
                subjects=[SUBJECT_ANALYSES_REQUEST],
                retention=RetentionPolicy.WORK_QUEUE,
            )
            await js.update_stream(analyses_config)
            
            # Configuração para o stream RESULTS (retenção por limite, ex: 7 dias)
            results_config = StreamConfig(
                name=STREAM_RESULTS,
                subjects=[SUBJECT_RESULTS_COMPLETED, "results.failed"], # Adicionando o de falha
                retention=RetentionPolicy.LIMITS,
                max_age=60 * 60 * 24 * 7 # 7 dias em segundos
            )
            await js.update_stream(results_config)
            
            logger.info("Streams garantidos/atualizados com sucesso.")

            async def message_handler_wrapper(msg):
                await self.message_handler(msg, js)

            sub = await js.subscribe(
                subject=SUBJECT_ANALYSES_REQUEST,
                queue=DURABLE_NAME,
                durable=DURABLE_NAME,
                cb=message_handler_wrapper,
                config=ConsumerConfig(ack_policy=AckPolicy.EXPLICIT, max_deliver=-1, ack_wait=30_000),
                manual_ack=True
            )
            logger.info(f"Inscrito em '{SUBJECT_ANALYSES_REQUEST}'. Aguardando mensagens...")

            await self.shutdown_event.wait()

        except Exception as e:
            logger.error(f"Erro fatal durante a execução: {e}", exc_info=True)
        finally:
            if sub:
                try:
                    await sub.unsubscribe()
                    await sub.drain()
                except Exception as e:
                    logger.error(f"Erro ao cancelar subscrição: {e}")
            
            if nc and nc.is_connected:
                try:
                    await nc.drain()
                except Exception as e:
                    logger.error(f"Erro ao fechar conexão NATS: {e}")

            logger.info("Serviço encerrado.")

    async def message_handler(self, msg, js: JetStreamContext):
        # --- (O message_handler permanece inalterado) ---
        request_id = "UNKNOWN"
        try:
            payload = json.loads(msg.data.decode())
            request_id = payload.get("requestId", "N/A")
            input_data = payload.get("data")

            if not isinstance(input_data, list):
                raise ValueError("Payload 'data' não é uma lista.")

            logger.info(f"[{request_id}] Mensagem recebida. Iniciando predição...")
            prediction_result = self.analysis_service.predict(input_data)
            logger.info(f"[{request_id}] Predição concluída. Resultado: {prediction_result}")

            result_payload = {"requestId": request_id, "result": prediction_result}
            await js.publish(SUBJECT_RESULTS_COMPLETED, json.dumps(result_payload).encode())
            logger.info(f"[{request_id}] Resultado publicado em '{SUBJECT_RESULTS_COMPLETED}'.")

            await msg.ack()
            logger.info(f"[{request_id}] Mensagem ACKed.")
        except Exception as e:
            logger.error(f"[{request_id}] Falha ao processar mensagem: {e}")
            await msg.nak(delay=5)

    async def on_error(self, e):
        logger.error(f"Erro de conexão NATS reportado: {e}")

    def ask_to_shutdown(self):
        self.shutdown_event.set()


async def main():
    try:
        analysis_service = AnalysisService(model_path=MODEL_PATH)
        analysis_service.load_model()
    except Exception as e:
        logger.error(f"Falha na inicialização do serviço de análise: {e}. O serviço não será iniciado.")
        return

    consumer = NatsConsumer(analysis_service)
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, consumer.ask_to_shutdown)

    await consumer.run()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass