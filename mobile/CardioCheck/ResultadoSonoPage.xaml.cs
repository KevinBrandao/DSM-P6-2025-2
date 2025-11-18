using CardioCheck.Model;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;

namespace CardioCheck;


public partial class ResultadoSonoPage : ContentPage
{
    // O construtor recebe o questionário original (dados do paciente) e o resultado da predição
    public ResultadoSonoPage(SonoRequestModel questionario, Resultado resultado)
    {
        InitializeComponent();
        PopulateData(questionario, resultado);
    }

    private void PopulateData(SonoRequestModel questionario, Resultado resultado)
    {
        // --- MÉTODOS AUXILIARES DE TRADUÇÃO INVERSA (De Inglês/Numérico para Português) ---

        // 0 = Feminino, 1 = Masculino (OpenAPI)
        string TraduzirGenero(int? genero) => genero switch
        {
            1 => "Masculino",
            0 => "Feminino",
            _ => "Não Informado"
        };

        // Mapeia o IMC de volta para o português (Baseado nos pickers da SonoPage.xaml)
        string TraduzirImcInverso(string imcEn) => imcEn switch
        {
            "Underweight" => "Abaixo do peso",
            "Normal" => "Peso normal",
            "Overweight" => "Sobrepeso",
            "Obese" => "Obesidade",
            _ => "Não Informado"
        };

        // Mapeia a ocupação de volta para o português (Baseado nos pickers da SonoPage.xaml)
        string TraduzirOcupacaoInverso(string ocupacaoEn) => ocupacaoEn switch
        {
            "Doctor" => "Médico(a)",
            "Engineer" => "Engenheiro(a)",
            "Nurse" => "Enfermeiro(a)",
            "Teacher" => "Professor(a)",
            "Lawyer" => "Advogado(a)",
            "Software Engineer" => "Engenheiro(a) de Software",
            "Scientist" => "Cientista",
            "Accountant" => "Contador(a)",
            "Manager" => "Gerente",
            "Sales Representative" => "Representante de Vendas",
            "Salesperson" => "Vendedor(a)",
            _ => "Outra"
        };

        // --- LÓGICA DE RISCO (Adaptação da ResultadoPage) ---
        // A API retorna 1 para Positivo/Alterado (Risco de Distúrbio) e 0 para Negativo/Normal (Sono Normal)
        bool isHighRisk = resultado.Predicao == 1; // Assumindo Predicao no C# Model

        var corResultado = isHighRisk ? Colors.Red : Colors.Green;
        var corFundoIcone = isHighRisk ? Color.FromRgba(255, 0, 0, 0.1) : Color.FromRgba(0, 128, 0, 0.1);
        var textoResultado = isHighRisk ? "RISCO DE DISTÚRBIO" : "SONO NORMAL";
        var iconeGlyph = isHighRisk ? "\uE808" : "\uE807"; // Símbolos da fonte (Triste/Feliz)

        // --- 1. Popula o card de resultado em destaque (Assumindo os mesmos nomes XAML) ---
        ResultadoBorder.Stroke = new SolidColorBrush(corResultado);
        ResultadoPredicaoLabel.Text = textoResultado;
        ResultadoPredicaoLabel.TextColor = corResultado;
        ResultadoRecomendacaoLabel.Text = resultado.Recomendacao; // Assumindo Recomendacao no C# Model

        // --- 2. Lógica do Ícone ---
        ResultadoIconCircle.BackgroundColor = corFundoIcone;
        ResultadoIcon.Source = new FontImageSource
        {
            Glyph = iconeGlyph,
            FontFamily = "FontIcons",
            Size = 45,
            Color = corResultado
        };

        // --- 3. Popula o resumo dos dados do paciente (Assumindo labels correspondentes) ---
        // Detalhes do Paciente
        NomeLabel.Text = questionario.nome;
        IdadeLabel.Text = questionario.age.ToString();

        // Aplicações de tradução
        SexoLabel.Text = TraduzirGenero(questionario.gender);
        OcupacaoLabel.Text = TraduzirOcupacaoInverso(questionario.occupation);
        ImcLabel.Text = TraduzirImcInverso(questionario.bmiCategory);

        // Campos numéricos e de texto formatados
        DuracaoSonoLabel.Text = $"{questionario.sleepDuration:F1} horas";
        QualidadeSonoLabel.Text = questionario.qualityOfSleep.ToString();
        AtividadeFisicaLabel.Text = questionario.physicalActivityLevel.ToString();
        NivelStressLabel.Text = questionario.stressLevel.ToString();
        PressaoLabel.Text = questionario.bloodPressure;
        FreqCardiacaLabel.Text = questionario.heartRate.ToString();
        PassosDiariosLabel.Text = questionario.dailySteps.ToString();
    }


    private async void OnFinalizarClicked(object sender, EventArgs e)
    {
        // 1. Envia a mensagem para quem estiver ouvindo (neste caso, a SonoPage)
        MessagingCenter.Send<object>(this, "LimparFormularioSono"); 

        // 2. Navega de volta para a tela raiz do aplicativo
        await Navigation.PopToRootAsync();
    }
}