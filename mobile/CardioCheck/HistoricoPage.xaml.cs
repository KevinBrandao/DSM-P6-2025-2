using System.Collections.ObjectModel;
using System.Net.Http.Headers;
using System.Text.Json;
using CardioCheck.Models;
using CardioCheck.Model;




namespace CardioCheck;

public partial class HistoricoPage : ContentPage
{
    public ObservableCollection<Avaliacao> Historico { get; set; }

    public HistoricoPage()
    {
        InitializeComponent();
        Historico = new ObservableCollection<Avaliacao>();

        // Define o 'BindingContext' para que o XAML possa encontrar a propriedade 'Historico'
        // e se ligar a ela. Isso permite que a CollectionView se atualize automaticamente.
        BindingContext = this;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        // Limpa a lista sempre que a página aparecer para não duplicar itens.
        Historico.Clear();
        await LoadHistorico();
    }
    

    private async Task LoadHistorico()
    {
        LoadingIndicator.IsRunning = true;
        HistoricoCollectionView.IsVisible = false; // Esconde a lista enquanto carrega

        try
        {
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SessaoLogin.Token);
            var url = $"{SessaoLogin.UrlApi}/historico/coracao";

            var response = await httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();

                // PONTO CRÍTICO: A API envia JSON com letras minúsculas (camelCase)
                // e o nosso modelo C# usa maiúsculas (PascalCase).
                // Esta opção faz com que o desserializador ignore essa diferença.
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var historicoList = JsonSerializer.Deserialize<List<Avaliacao>>(content, options);

                if (historicoList != null)
                {
                    // Ordena os resultados do mais novo para o mais antigo.
                    var historicoOrdenado = historicoList.OrderByDescending(item => item.Data);
                    foreach (var item in historicoOrdenado)
                    {
                        Historico.Add(item);
                    }
                }
            }
            else
            {
                await DisplayAlert("Erro de API", "Não foi possível carregar o histórico. O servidor respondeu com um erro.", "OK");
            }
        }
        catch (JsonException jsonEx)
        {
            // Este erro acontece se o JSON da API não for compatível com o modelo 'Avaliacao.cs'.
            await DisplayAlert("Erro de Dados", $"O formato dos dados recebidos da API está incorreto. Verifique se o backend foi atualizado para enviar nome e idade do paciente.\n\nDetalhe técnico: {jsonEx.Message}", "OK");
        }
        catch (Exception ex)
        {
            await DisplayAlert("Erro de Conexão", $"Ocorreu um erro geral: {ex.Message}", "OK");
        }
        finally
        {
            LoadingIndicator.IsRunning = false;
            HistoricoCollectionView.IsVisible = true; // Mostra a lista após o carregamento
        }
    }

    async private void OnTapped(object sender, TappedEventArgs e)
    {
        if (sender is Frame frame && frame.BindingContext is Model.Avaliacao avaliacao)
        {
            // Coloque aqui a lógica desejada para o item clicado
            await Navigation.PushAsync(new ResultadoPage(avaliacao.Questionario, avaliacao.ToResultado()));
        }

    }
}