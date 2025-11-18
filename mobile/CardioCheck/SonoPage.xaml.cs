using CardioCheck.Model;
using System.Text.Json;
using System.Text;

namespace CardioCheck;


public partial class SonoPage : ContentPage
{
    // Use um HttpClient estático para melhor performance
    private static readonly HttpClient client = new HttpClient();

    public SonoPage()
    {
        InitializeComponent();

        // Define os valores iniciais dos labels dos sliders (descomentado)
        OnSliderValueChanged(DuracaoSonoSlider, new ValueChangedEventArgs(DuracaoSonoSlider.Value, DuracaoSonoSlider.Value));
        OnSliderValueChanged(AtividadeSlider, new ValueChangedEventArgs(AtividadeSlider.Value, AtividadeSlider.Value));
        OnSliderValueChanged(PassosSlider, new ValueChangedEventArgs(PassosSlider.Value, PassosSlider.Value));
        OnSliderValueChanged(StressSlider, new ValueChangedEventArgs(StressSlider.Value, StressSlider.Value));
        OnSliderValueChanged(QualidadeSonoSlider, new ValueChangedEventArgs(QualidadeSonoSlider.Value, QualidadeSonoSlider.Value));
    }

    private async void OnAnalisarClicked(object sender, EventArgs e)
    {
        // --- INÍCIO DA LÓGICA DE COLETA E TRADUÇÃO ---

        var requestData = new SonoRequestModel
        {
            nome = NomeEntry.Text,
            gender = TraduzirGenero(SexoPicker.SelectedItem as string),
            age = int.TryParse(IdadeEntry.Text, out int i) ? i : 0,
            occupation = TraduzirOcupacao(OcupacaoPicker.SelectedItem as string),
            sleepDuration = DuracaoSonoSlider.Value,
            qualityOfSleep = (int)QualidadeSonoSlider.Value,
            physicalActivityLevel = (int)AtividadeSlider.Value,
            stressLevel = (int)StressSlider.Value,
            bmiCategory = TraduzirImc(ImcPicker.SelectedItem as string),
            bloodPressure = PressaoEntry.Text,
            heartRate = int.TryParse(FreqCardiacaEntry.Text, out int f) ? f : 0,
            dailySteps = (int)PassosSlider.Value
        };

        // --- FIM DA LÓGICA DE COLETA ---

        try
        {
            // 1. Serializar os dados para JSON
            string jsonPayload = JsonSerializer.Serialize(requestData);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            // 2. Enviar para a API (substitua pela URL real do seu backend)
            // Ex: "https://seu-backend.com/api/sono"
            string apiUrl = "URL_DA_SUA_API_AQUI";

            HttpResponseMessage response = await client.PostAsync(apiUrl, content);

            // 3. Tratar a resposta
            if (response.IsSuccessStatusCode)
            {
                string responseBody = await response.Content.ReadAsStringAsync();
                // Ex: Deserializar a resposta e navegar para a página de resultado
                // var resultado = JsonSerializer.Deserialize<ResultadoModel>(responseBody);
                // await Navigation.PushAsync(new ResultadoSonoPage(resultado));

                await DisplayAlert("Sucesso", "Dados enviados com sucesso!", "OK");
            }
            else
            {
                // Mostra o erro do backend se houver
                string errorBody = await response.Content.ReadAsStringAsync();
                await DisplayAlert("Erro", $"Falha ao enviar dados: {response.StatusCode}\nDetalhes: {errorBody}", "OK");
            }
        }
        catch (Exception ex)
        {
            // Captura erros de rede ou outros
            await DisplayAlert("Erro de Conexão", $"Não foi possível conectar à API: {ex.Message}", "OK");
        }
    }

    private void OnSliderValueChanged(object sender, ValueChangedEventArgs e)
    {
        // Atualiza os labels dos sliders em tempo real (descomentado)
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

    // --- MÉTODOS DE TRADUÇÃO ---

    private int? TraduzirGenero(string generoPt)
    {
        switch (generoPt)
        {
            case "Feminino": return 0;
            case "Masculino": return 1;
            default: return null; // "Prefiro não informar" ou nulo
        }
    }

    private string TraduzirImc(string imcPt)
    {
        switch (imcPt)
        {
            case "Abaixo do peso": return "Underweight";
            case "Peso normal": return "Normal";
            case "Sobrepeso": return "Overweight";
            case "Obesidade": return "Obese";
            default: return null;
        }
    }

    private string TraduzirOcupacao(string ocupacaoPt)
    {
        // Mapeia de volta para o inglês que o backend espera
        switch (ocupacaoPt)
        {
            case "Médico(a)": return "Doctor";
            case "Engenheiro(a)": return "Engineer";
            case "Enfermeiro(a)": return "Nurse";
            case "Professor(a)": return "Teacher";
            case "Advogado(a)": return "Lawyer";
            case "Engenheiro(a) de Software": return "Software Engineer";
            case "Cientista": return "Scientist";
            case "Contador(a)": return "Accountant";
            case "Gerente": return "Manager";
            case "Representante de Vendas": return "Sales Representative";
            case "Vendedor(a)": return "Salesperson";
            default: return null;
        }
    }
}