# Projeto CardioCheck: Aplicação Mobile para Verificação de Risco de Doença Cardíaca

## Memorial Descritivo do Projeto

### Visão Geral
O CardioCheck é uma aplicação mobile para dispositivos Android que utiliza inteligência artificial para avaliar o risco de doenças cardíacas com base em dados fornecidos pelo usuário. A aplicação coleta informações como sintomas, resultados de exames, frequência cardíaca, idade e sexo, processando-os através de um modelo de classificação para determinar a probabilidade de presença de doença cardíaca.

### Arquitetura do Sistema
O sistema é composto por quatro componentes principais:
- **Aplicação Mobile (Frontend):** Desenvolvida em C# utilizando o framework .NET MAUI para garantir uma interface responsiva e intuitiva para dispositivos Android.
- **API (Backend):** Implementada em Node.js com Express, responsável por gerenciar as requisições do aplicativo, autenticação de usuários e comunicação com o modelo de IA.
- **Servidor:** Hospedado na Azure em uma VM Ubuntu Server, garantindo escalabilidade, segurança e alta disponibilidade.
- **Modelo de IA:** Desenvolvido em Python, utiliza algoritmos de aprendizado de máquina para classificar o risco de doença cardíaca com base nos dados fornecidos pelo usuário.

### Fluxo de Dados
- O médico se cadastra e faz login no aplicativo
- O médico preenche o questionário com dados de saúde do paciente
- Os dados são enviados para a API
- A API encaminha os dados para o modelo de IA
- O modelo processa os dados e retorna uma classificação (0 - Normal, 1 - Risco de doença cardíaca)
- O resultado é armazenado no banco de dados e exibido para o médico
- Recomendações são fornecidas com base no resultado adquirido pelo questionário

### Análise de Requisitos

### 1. Requisitos Funcionais
**RF01 - Cadastro do Médico**
- O sistema deve permitir o cadastro de novos médicos coletando: Nome, Idade, Sexo, Email, Senha, Endereço, Telefone e CPF
- O sistema deve validar a unicidade do CPF e email
- O sistema deve criptografar a senha do usuário antes de armazená-la

**RF02 - Autenticação de Usuário**
- O sistema deve permitir login utilizando CPF ou Email e Senha
- O sistema deve emitir e validar tokens JWT para manter a sessão do usuário
- O sistema deve permitir a recuperação de senha via email

**RF03 - Questionário de Saúde**
- O sistema deve apresentar um questionário com 9 perguntas relacionadas a fatores de risco para doenças cardíacas
- O sistema deve coletar e validar os seguintes dados:
   - Tipo de dor no peito (numérico)
   - Pressão arterial em repouso (numérico)
   - Colesterol sérico em mg/dl (numérico)
   - Glicemia de jejum > 120 mg/dl (booleano)
   - Resultados de eletrocardiograma em repouso (categórico)
   - Frequência cardíaca máxima atingida (numérico)
   - Angina induzida por exercício (booleano)
   - Depressão do segmento ST induzida por exercício (numérico)
   - Inclinação do segmento ST de pico do exercício (categórico)

**RF04 - Processamento e Classificação**
- O sistema deve enviar os dados coletados para processamento pelo modelo de IA
- O sistema deve classificar o risco de doença cardíaca (0 - Normal, 1 - Risco de doença)

**RF05 - Visualização de Resultados**
- O sistema deve exibir o resultado da classificação de forma clara e compreensível
- O sistema deve apresentar recomendações médicas baseadas no resultado, indicando a necessidade de procurar um especialista (cardiologista)

**RF06 - Histórico de Avaliações**
- O sistema deve armazenar o histórico de todas as avaliações realizadas
- O sistema deve permitir a visualização do histórico 

### 2. Requisitos Não Funcionais
**RNF01 - Desempenho**
- O tempo de resposta para processamento do questionário não deve exceder 30 segundos
- A aplicação deve suportar até 1000 usuários simultâneos
- O sistema deve processar até 10.000 avaliações por dia

**RNF02 - Segurança**
- Todos os dados pessoais e médicos devem ser criptografados em trânsito e em repouso
- O sistema deve estar em conformidade com a LGPD (Lei Geral de Proteção de Dados)
- O sistema deve realizar backups diários dos dados

**RNF03 - Usabilidade**
- A interface deve ser intuitiva e acessível para usuários de todas as idades
- O sistema deve fornecer feedback claro sobre erros e ações realizadas

**RNF04 - Escalabilidade**
- A arquitetura deve permitir escalar horizontalmente para atender ao aumento de demanda
- O banco de dados deve suportar crescimento de até 1GB por ano

**RNF05 - Compatibilidade**
- O aplicativo deve ser compatível com Android 8.0 (Oreo) ou superior
- A interface deve se adaptar a diferentes tamanhos de tela

### Validações Técnicas
**Tipo de Dor no Peito:**
- **Validação:** Apenas valores 1, 2, 3 ou 4 são aceitos
- **Obrigatório:** Sim

**Pressão Arterial em Repouso:**
- **Validação:** Valor numérico entre 90 e 200 mm Hg
- Alerta se < 90 ou > 180 mm Hg
- **Obrigatório:** Sim

**Colesterol Sérico:**
- **Validação:** Valor numérico entre 100 e 600 mg/dl
- Alerta se < 130 ou > 240 mg/dl
- **Obrigatório:** Sim

**Glicemia de Jejum:**
- **Validação:** Apenas valores 0 ou 1 são aceitos
- **Obrigatório:** Sim

**Resultados de Eletrocardiograma em Repouso:**
- **Validação:** Apenas valores 0, 1 ou 2 são aceitos
- **Obrigatório:** Sim

**Frequência Cardíaca Máxima Atingida:**
- **Validação:** Valor numérico entre 71 e 202 bpm
- Alerta se valor for inconsistente com a idade (220 - idade)
- **Obrigatório:** Sim

**Angina Induzida por Exercício:**
- **Validação:** Apenas valores 0 ou 1 são aceitos
- **Obrigatório:** Sim

**Depressão do Segmento ST:**
- **Validação:** Valor numérico entre 0 e 6.2
- **Obrigatório:** Sim

**Inclinação do Segmento ST:**
- **Validação:** Apenas valores 0, 1 ou 2 são aceitos
- **Obrigatório:** Sim

### Regras de Negócio
**RN01 - Cadastro e Acesso**
- Apenas usuários médicos podem se cadastrar no sistema
- Um CPF só pode estar associado a uma única conta
- Um email só pode estar associado a uma única conta

**RN02 - Avaliação de Risco**
- O modelo de IA deve ser treinado com o dataset do Kaggle especificado
- A precisão mínima aceitável do modelo de classificação é de 85%

**RN03 - Recomendações Médicas**
- Usuários classificados com risco de doença cardíaca devem receber recomendação para consultar um cardiologista em até 30 dias
- Usuários classificados como normais devem receber recomendações preventivas

**RN04 - Privacidade e Ética**
- Os dados dos usuários não podem ser compartilhados com terceiros sem consentimento explícito
- O sistema deve apresentar termos de uso e política de privacidade claros

**RN05 - Limitações e Avisos**
- O sistema deve exibir claramente que não substitui diagnóstico médico profissional
- Resultados críticos devem ser acompanhados de avisos sobre a urgência de buscar atendimento médico

**RN06 - Anexos**
- O sistema deve permitir que o usuário anexe resultados de exames (opcional) para referência futura

### Justificativa
As doenças cardiovasculares são a principal causa de morte no mundo, sendo responsáveis por aproximadamente 17,9 milhões de óbitos anualmente, segundo a Organização Mundial da Saúde. A detecção precoce de fatores de risco e a identificação de sinais de alerta podem salvar vidas e reduzir custos com tratamentos intensivos.
O CardioCheck visa democratizar o acesso a uma ferramenta que pode alertar sobre potenciais riscos cardíacos, incentivando a busca por atendimento médico especializado quando necessário. A aplicação não substitui o diagnóstico do médico especialista, mas serve como um primeiro passo para conscientização e prevenção.
A escolha das tecnologias (.NET MAUI, Node.js, Azure e Python) permite o desenvolvimento de uma solução robusta, escalável e segura, capaz de processar dados sensíveis de saúde com a devida proteção e confiabilidade. O uso de inteligência artificial possibilita a análise de múltiplos fatores de risco simultaneamente, oferecendo uma avaliação mais abrangente do que métodos tradicionais de triagem.

### Diagrama de Classes do Banco de Dados
![alt text](<image_db.png>)

### BPMN (Business Process Model and Notation)
### 1. Processo Principal do CardioCheck
![alt text](<BPMN1.png>)

### 2. Subprocesso: Cadastro de Usuário
![alt text](<BPMN2.png>)

### 3. Subprocesso: Preenchimento do Questionário
![alt text](<BPMN3.png>)

### 4. Subprocesso: Análise pelo Modelo de IA
![alt text](<BPMN4.png>)

![alt text](<BPMN5.png>)

### Detalhamento das Telas
1. **Tela de Cadastro**
- Campos para entrada de dados pessoais (Nome, CRM, Email, Senha, Especialidade)
- Validação em tempo real dos campos
- Botão para enviar cadastro
- Link para tela de login (caso já tenha conta)

2. **Tela de Login**
- Campo para CPF ou Email
- Campo para Senha
- Opção "Lembrar-me"
- Link para recuperação de senha
- Botão para entrar
- Link para tela de cadastro

3. **Tela de Questionário**
- Formulário com 9 perguntas sobre fatores de risco cardíaco
- Campos adequados para cada tipo de dado (numérico, booleano, categórico)
- Explicações sobre cada pergunta
- Botão para enviar respostas
- Botão para limpar formulário

4. **Tela de Resultados**
- Indicação visual clara do resultado (0 - Normal, 1 - Risco de doença)
- Explicação detalhada do significado do resultado
- Indicação para procurar especialista (cardiologista, quando necessário)
- Botão para salvar ou compartilhar resultado
- Botão para realizar nova avaliação

5. **Tela de Histórico**
- Lista de cards mostrando avaliações anteriores
- Cada card contém data e resultado (positivo/negativo)
- Opção para filtrar por período
- Opção para ordenar por data
- Gráfico de tendência (opcional)

### Conclusão
O CardioCheck representa uma solução inovadora para triagem preliminar de riscos cardíacos, utilizando tecnologias modernas e inteligência artificial para fornecer uma avaliação acessível e rápida. A aplicação tem o potencial de contribuir significativamente para a conscientização sobre saúde cardíaca e incentivar a busca por atendimento médico preventivo.
A arquitetura proposta garante segurança, escalabilidade e usabilidade, enquanto o modelo de IA treinado com dados reais proporciona resultados confiáveis. O projeto segue as melhores práticas de desenvolvimento ágil, permitindo iterações e melhorias contínuas com base no feedback dos usuários e avanços na área médica.