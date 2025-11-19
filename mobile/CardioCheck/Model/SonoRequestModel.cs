using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace CardioCheck.Model
{
    public class SonoRequestModel
    {
        [JsonPropertyName("nome")]
        public string nome { get; set; }

        [JsonPropertyName("gender")]
        public int? gender { get; set; } // Já estava anulável

        [JsonPropertyName("age")]
        public int? age { get; set; } // CORRIGIDO: de int para int?

        [JsonPropertyName("occupation")]
        public string occupation { get; set; }

        [JsonPropertyName("sleepDuration")]
        public double? sleepDuration { get; set; } // CORRIGIDO: de double para double? (RESOLVE O ERRO REPORTADO)

        [JsonPropertyName("qualityOfSleep")]
        public int? qualityOfSleep { get; set; } // CORRIGIDO: de int para int?

        [JsonPropertyName("physicalActivityLevel")]
        public int? physicalActivityLevel { get; set; } // CORRIGIDO: de int para int?

        [JsonPropertyName("stressLevel")]
        public int? stressLevel { get; set; } // CORRIGIDO: de int para int?

        [JsonPropertyName("bmiCategory")]
        public string bmiCategory { get; set; }

        [JsonPropertyName("bloodPressure")]
        public string bloodPressure { get; set; }

        [JsonPropertyName("heartRate")]
        public int? heartRate { get; set; } // CORRIGIDO: de int para int?

        [JsonPropertyName("dailySteps")]
        public int? dailySteps { get; set; } // CORRIGIDO: de int para int?
    }
}