using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Maui.Graphics;

namespace CardioCheck.Model
{
    public class HistoricoItem
    {
        // Propriedades de identificação
        public TipoAvaliacao Tipo { get; set; }
        public DateTime Data { get; set; }

        // Propriedades para exibição na lista
        public string NomePaciente { get; set; }
        public int IdadePaciente { get; set; }
        public string ResultadoTexto { get; set; }
        public Color ResultadoCor { get; set; }

        // Propriedades de apoio do Item
        public string TipoTexto => Tipo == TipoAvaliacao.Coracao ? "Cardíaca" : "Sono";
        // Definição das cores para o chip/badge
        public Color TipoCor => Tipo == TipoAvaliacao.Coracao ? Color.FromArgb("#DC3545") : Color.FromArgb("#0078D4");
        public string IconeGlyph => Tipo == TipoAvaliacao.Coracao ? "\uF004" : "\uF869"; // Exemplo de ícones: Coração/Cama
        public string DataFormatada => Data.ToLocalTime().ToString("dd/MM/yyyy HH:mm");

        // Armazena o objeto original completo (Avaliacao ou AvaliacaoSono) para uso no clique.
        public object DadosOriginais { get; set; }
    }
}
