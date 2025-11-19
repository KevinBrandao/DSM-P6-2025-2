using System.Collections.ObjectModel;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Linq;
using CardioCheck.Model;
using CardioCheck.Models;
using System.Threading.Tasks;
using Microsoft.Maui.Graphics; // Necessário para Colors

namespace CardioCheck;

public partial class HistoricoSonoPage : ContentPage
{
    // Usaremos AvaliacaoSono diretamente para a coleção
    public ObservableCollection<AvaliacaoSono> HistoricoSono { get; set; }

    public HistoricoSonoPage()
    {
        InitializeComponent();
        HistoricoSono = new ObservableCollection<AvaliacaoSono>();

        // Define o 'BindingContext'
        BindingContext = this;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        HistoricoSono.Clear();
        await LoadHistoricoSono();
    }


    private async Task LoadHistoricoSono()
    {
        LoadingIndicator.IsRunning = true;
        HistoricoSonoCollectionView.IsVisible = false; // Nome da CollectionView no XAML

        try
        {
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SessaoLogin.Token);

            var url = $"{SessaoLogin.UrlApi}/historico/sono";

            // Permite desserialização mesmo com diferença de capitalização (camelCase vs PascalCase)
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var response = await httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();

                // ATENÇÃO: Se o JSON for uma string de erro (e não uma lista vazia), a desserialização falhará.
                // Usar AvaliacaoSono com tipos anuláveis agora resolve erros de 'null' em campos numéricos.
                var listaSono = JsonSerializer.Deserialize<List<AvaliacaoSono>>(content, options) ?? new List<AvaliacaoSono>();

                if (listaSono.Count > 0)
                {
                    // Mapeia e adiciona propriedades auxiliares de UI
                    var listaMapeada = listaSono.Select(a =>
                    {
                        // Estas propriedades foram adicionadas ao modelo AvaliacaoSono.cs
                        a.ResultadoTexto = a.Resultado == 1 ? "RISCO DISTÚRBIO" : "SONO NORMAL";
                        a.ResultadoCor = a.Resultado == 1 ? Colors.Red : Colors.Green;

                        // Proteção contra a data ser nula (embora deva vir do backend)
                        a.DataFormatada = a.Data == DateTime.MinValue ? "Data Inválida" : a.Data.ToLocalTime().ToString("dd/MM/yyyy HH:mm");
                        return a;
                    }).OrderByDescending(item => item.Data);

                    foreach (var item in listaMapeada)
                    {
                        HistoricoSono.Add(item);
                    }
                }
            }
            else
            {
                string errorBody = await response.Content.ReadAsStringAsync();
                await DisplayAlert("Erro de API", $"Falha ao carregar histórico: {response.StatusCode}\nDetalhes: {errorBody}", "OK");
            }
        }
        catch (Exception ex)
        {
            // Se o erro JsonException persistir, a estrutura JSON é incompatível com AvaliacaoSono.cs
            await DisplayAlert("Erro de Conexão", $"Ocorreu um erro geral: {ex.Message}", "OK");
        }
        finally
        {
            LoadingIndicator.IsRunning = false;
            HistoricoSonoCollectionView.IsVisible = true;
        }
    }

    async private void OnTapped(object sender, TappedEventArgs e)
    {
        if (sender is Frame frame && frame.BindingContext is AvaliacaoSono avaliacaoSono)
        {
            // Mapeia os dados de AvaliacaoSono para o modelo Resultado
            var resultado = new Resultado
            {
                Predicao = avaliacaoSono.Resultado,
                Recomendacao = avaliacaoSono.Recomendacao
            };

            // Navega para a página de resultado de sono.
            await Navigation.PushAsync(new ResultadoSonoPage(avaliacaoSono.Questionario, resultado));
        }
    }
}