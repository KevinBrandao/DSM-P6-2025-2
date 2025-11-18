using CardioCheck.Models;
using CardioCheck.Model;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers; // NECESSÁRIO
using System.Globalization;     // NECESSÁRIO
using System.Threading.Tasks;

namespace CardioCheck;


public partial class SonoPage : ContentPage
{
    // Use um HttpClient estático para melhor performance
    private static readonly HttpClient client = new HttpClient();

    public SonoPage()
    {
        InitializeComponent();

        // 1. Configura a subscrição para a limpeza do formulário (Chamado por ResultadoSonoPage)
        MessagingCenter.Subscribe<object>(this, "LimparFormularioSono", async (sender) =>
        {
            await ClearFormSono();
        });

        // Define os valores iniciais dos labels dos sliders
        OnSliderValueChanged(DuracaoSonoSlider, new ValueChangedEventArgs(DuracaoSonoSlider.Value, DuracaoSonoSlider.Value));
        OnSliderValueChanged(AtividadeSlider, new ValueChangedEventArgs(AtividadeSlider.Value, AtividadeSlider.Value));
        OnSliderValueChanged(PassosSlider, new ValueChangedEventArgs(PassosSlider.Value, PassosSlider.Value));
        OnSliderValueChanged(StressSlider, new ValueChangedEventArgs(StressSlider.Value, StressSlider.Value));
        OnSliderValueChanged(QualidadeSonoSlider, new ValueChangedEventArgs(QualidadeSonoSlider.Value, QualidadeSonoSlider.Value));
    }

    private async void OnAnalisarClicked(object sender, EventArgs e)
    {
        // 1. Validação
        if (!ValidateInputs())
        {
            await DisplayAlert("Erro de Validação", "Por favor, preencha todos os campos obrigatórios corretamente.", "OK");
            return;
        }

        // Cria o modelo de requisição com os dados traduzidos (o restante do seu código)
        var requestData = new SonoRequestModel
        {
            nome = NomeEntry.Text,
            gender = TraduzirGenero(SexoPicker.SelectedItem as string),
            age = int.TryParse(IdadeEntry.Text, out int i) ? i : 0,
            occupation = TraduzirOcupacao(OcupacaoPicker.SelectedItem as string),
            // Usa CultureInfo.InvariantCulture para garantir que o ponto decimal seja usado na serialização
            sleepDuration = double.Parse(DuracaoSonoSlider.Value.ToString(CultureInfo.InvariantCulture), CultureInfo.InvariantCulture),
            qualityOfSleep = (int)QualidadeSonoSlider.Value,
            physicalActivityLevel = (int)AtividadeSlider.Value,
            stressLevel = (int)StressSlider.Value,
            bmiCategory = TraduzirImc(ImcPicker.SelectedItem as string),
            bloodPressure = PressaoEntry.Text,
            heartRate = int.TryParse(FreqCardiacaEntry.Text, out int f) ? f : 0,
            dailySteps = (int)PassosSlider.Value
        };

        try
        {
            // 2. Define o token de autenticação
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SessaoLogin.Token);

            // 3. Define a URL da API, usando a rota correta do OpenAPI
            var url = $"{SessaoLogin.UrlApi}/questionarios/sono";

            // 4. Serializar e enviar
            string jsonPayload = JsonSerializer.Serialize(requestData);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync(url, content);
            string responseBody = await response.Content.ReadAsStringAsync();

            // 5. Tratar a resposta
            if (response.IsSuccessStatusCode)
            {
                // Deserializar a resposta (Modelo Resultado da API)
                var resultadoResponse = JsonSerializer.Deserialize<Resultado>(responseBody);

                // Navegar para a página de resultado de sono
                await Navigation.PushAsync(new ResultadoSonoPage(requestData, resultadoResponse));
            }
            else
            {
                // Mostra o erro do backend
                await DisplayAlert("Erro da API", $"Falha ao processar a avaliação. Status: {response.StatusCode}\nDetalhes: {responseBody}", "OK");
            }
        }
        catch (Exception ex)
        {
            // Captura erros de rede, desserialização ou outros
            await DisplayAlert("Erro Crítico", $"Ocorreu um erro: {ex.Message}", "OK");
        }
    }

    private void OnSliderValueChanged(object sender, ValueChangedEventArgs e)
    {
        // Atualiza os labels dos sliders
        if (sender == DuracaoSonoSlider)
        {
            DuracaoSonoLabel.Text = $"{e.NewValue:F1} horas";
        }
        else if (sender == AtividadeSlider)
        {
            AtividadeLabel.Text = $"{(int)e.NewValue}";
        }
        else if (sender == PassosSlider)
        {
            PassosLabel.Text = $"{(int)e.NewValue} passos";
        }
        else if (sender == StressSlider)
        {
            StressLabel.Text = $"{(int)e.NewValue}";
        }
        else if (sender == QualidadeSonoSlider)
        {
            QualidadeSonoLabel.Text = $"{(int)e.NewValue}";
        }
    }

    // --- MÉTODOS DE SUPORTE ---

    private bool ValidateInputs()
    {
        // Adiciona validação simples para campos obrigatórios
        return !string.IsNullOrWhiteSpace(NomeEntry.Text) &&
               int.TryParse(IdadeEntry.Text, out _) &&
               !string.IsNullOrWhiteSpace(PressaoEntry.Text) &&
               int.TryParse(FreqCardiacaEntry.Text, out _) &&
               SexoPicker.SelectedIndex != -1 &&
               OcupacaoPicker.SelectedIndex != -1 &&
               ImcPicker.SelectedIndex != -1;
    }

    public async Task ClearFormSono()
    {
        // Implementação da limpeza do formulário (chamado via MessagingCenter)
        NomeEntry.Text = string.Empty;
        IdadeEntry.Text = string.Empty;
        PressaoEntry.Text = string.Empty;
        FreqCardiacaEntry.Text = string.Empty;

        // Reseta Pickers
        SexoPicker.SelectedIndex = -1;
        OcupacaoPicker.SelectedIndex = -1;
        ImcPicker.SelectedIndex = -1;

        // Reseta Sliders para os valores iniciais
        DuracaoSonoSlider.Value = 8.0;
        AtividadeSlider.Value = 50;
        PassosSlider.Value = 5000;
        StressSlider.Value = 4;
        QualidadeSonoSlider.Value = 7;

        // CORREÇÃO: Usa o nome da instância da ScrollView
        await MainScrollView.ScrollToAsync(0, 0, true);
    }

    // --- MÉTODOS DE TRADUÇÃO ---

    private int? TraduzirGenero(string generoPt)
    {
        return generoPt switch
        {
            "Feminino" => 0,
            "Masculino" => 1,
            _ => null,
        };
    }

    private string TraduzirImc(string imcPt)
    {
        return imcPt switch
        {
            "Abaixo do peso" => "Underweight",
            "Peso normal" => "Normal",
            "Sobrepeso" => "Overweight",
            "Obesidade" => "Obese",
            _ => null,
        };
    }

    private string TraduzirOcupacao(string ocupacaoPt)
    {
        return ocupacaoPt switch
        {
            "Médico(a)" => "Doctor",
            "Engenheiro(a)" => "Engineer",
            "Enfermeiro(a)" => "Nurse",
            "Professor(a)" => "Teacher",
            "Advogado(a)" => "Lawyer",
            "Engenheiro(a) de Software" => "Software Engineer",
            "Cientista" => "Scientist",
            "Contador(a)" => "Accountant",
            "Gerente" => "Manager",
            "Representante de Vendas" => "Sales Representative",
            "Vendedor(a)" => "Salesperson",
            _ => null,
        };
    }
}