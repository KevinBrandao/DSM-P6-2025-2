using CardioCheck.Models;
using System.Collections.ObjectModel; // Usado para coleções que notificam a UI

namespace CardioCheck;

// Modelo de dados para cada slide do carrossel
public class Slide
{
    public string Icon { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
}

public partial class HomePage : ContentPage
{
    // Propriedade que armazena os dados dos slides
    public List<Slide> Slides { get; set; }

    // Variável para controlar o timer
    private IDispatcherTimer _timer;

    public HomePage()
    {
        InitializeComponent();

        // Cria a lista de slides com 3 conteúdos diferentes
        Slides = new List<Slide>
        {
            new Slide { Icon = "icone_apoio.gif", Title = "Análise do Sono", Description = "Utilize HealthCheck para uma avaliação de disturbios do sono." },
            new Slide { Icon = "icone_dados.gif", Title = "Baseado em Dados", Description = "Nosso algoritmo é treinado com casos reais para oferecer um apoio à sua decisão clínica." },
            new Slide { Icon = "icone_analise.gif", Title = "Apoio à Decisão Médica", Description = "Uma ferramenta moderna para auxiliar na triagem e no encaminhamento de pacientes." }
        };

        // Define o BindingContext para que o XAML possa encontrar a lista "Slides"
        this.BindingContext = this;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();

        // Associa o IndicatorView (bolinhas) com o CarouselView
        CarouselIndicator.ItemsSource = FeaturesCarousel.ItemsSource;
        CarouselIndicator.BindingContext = FeaturesCarousel;
        CarouselIndicator.SetBinding(IndicatorView.PositionProperty, "Position");


        // Cria e inicia o timer para rotação automática
        _timer = Dispatcher.CreateTimer();
        _timer.Interval = TimeSpan.FromSeconds(5); // Define o intervalo de 4 segundos
        _timer.Tick += Timer_Tick;
        _timer.Start();
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();

        // Para o timer quando a página não está visível para economizar recursos
        _timer?.Stop();
    }

    // Este método é chamado a cada 4 segundos pelo timer
    private void Timer_Tick(object sender, EventArgs e)
    {
        if (Slides is not null && Slides.Count > 0)
        {
            // Avança para o próximo slide
            // O operador '%' garante que ele volte ao início (0) após o último slide
            int nextPosition = (FeaturesCarousel.Position + 1) % Slides.Count;
            FeaturesCarousel.Position = nextPosition;
        }
    }



    private void OnStartClicked(object sender, EventArgs e)
    {

        if (this.Parent is TabbedPage tabbedPage)
        {

            var cardiocheckTab = tabbedPage.Children.FirstOrDefault(p => p is QuestionarioPage || p.Title == "Cardiocheck");


            if (cardiocheckTab != null)
            {
                tabbedPage.CurrentPage = cardiocheckTab;
            }
            else
            {
                DisplayAlert("Erro", "A aba Cardiocheck não foi encontrada.", "OK");
            }
        }
    }


    // Lógica para o botão de logout 
    private async void OnLogoutClicked(object sender, TappedEventArgs e)
    {
        // 1. Pede confirmação ao usuário.
        bool confirmarSaida = await DisplayAlert(
            "Confirmar Saída",
            "Tem a certeza de que deseja sair da sua conta?",
            "Sim, Sair",
            "Cancelar"
        );

        if (confirmarSaida)
        {
            // 2. Chama o método para limpar o Email e o Token.
            SessaoLogin.Logout();

            // 3. Redireciona para a página de Login, reiniciando a aplicação.
            Application.Current.MainPage = new NavigationPage(new LoginPage());
        }
    }
}
