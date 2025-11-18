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
        public int? gender { get; set; } // int? (nullable) para o caso de "Prefiro não informar"

        [JsonPropertyName("age")]
        public int age { get; set; }

        [JsonPropertyName("occupation")]
        public string occupation { get; set; }

        [JsonPropertyName("sleepDuration")]
        public double sleepDuration { get; set; }

        [JsonPropertyName("qualityOfSleep")]
        public int qualityOfSleep { get; set; }

        [JsonPropertyName("physicalActivityLevel")]
        public int physicalActivityLevel { get; set; }

        [JsonPropertyName("stressLevel")]
        public int stressLevel { get; set; }

        [JsonPropertyName("bmiCategory")]
        public string bmiCategory { get; set; }

        [JsonPropertyName("bloodPressure")]
        public string bloodPressure { get; set; }

        [JsonPropertyName("heartRate")]
        public int heartRate { get; set; }

        [JsonPropertyName("dailySteps")]
        public int dailySteps { get; set; }
    }
}