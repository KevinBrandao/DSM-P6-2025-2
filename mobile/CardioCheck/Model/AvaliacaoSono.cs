using System;
using System.Text.Json.Serialization;

namespace CardioCheck.Model
{
    // Este modelo mapeia o JSON retornado pela rota /historico/sono
    public class AvaliacaoSono
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } // Mapeia "id" (TS) para Id (C#)

        [JsonPropertyName("data")]
        public DateTime Data { get; set; } // Mapeia "data" (TS) para Data (C#)

        [JsonPropertyName("resultado")]
        public int Resultado { get; set; } // Mapeia "resultado" (TS) para Resultado (C#)

        [JsonPropertyName("recomendacao")]
        public string Recomendacao { get; set; } // Mapeia "recomendacao" (TS) para Recomendacao (C#)

        [JsonPropertyName("medicoId")]
        public string MedicoId { get; set; }

        [JsonPropertyName("questionarioId")]
        public string QuestionarioId { get; set; }

        // O campo 'questionario' não está explícito no IAvaliacaoSono.ts, 
        // mas é NECESSÁRIO para o mapeamento completo e navegação.
        // Assumiremos que o backend o anexa e que ele é do tipo SonoRequestModel.
        // Se o seu backend estiver usando 'questionario' como campo
        [JsonPropertyName("questionario")]
        public SonoRequestModel Questionario { get; set; }


        public string ResultadoTexto { get; set; }
        public Color ResultadoCor { get; set; }
        public string DataFormatada { get; set; }

        public Resultado ToResultado()
        {
            return new Resultado
            {
                Predicao = Resultado,
                Recomendacao = Recomendacao
            };
        }
    }
}