export interface QuestionarioSonoRequest {
    Gender: number;           
    Age: number;              
    Occupation: string;       
    "Sleep Duration": number; 
    "Quality of Sleep": number; 
    "Physical Activity Level": number; 
    "Stress Level": number;   
    "BMI Category": string;   
    "Blood Pressure": string; 
    "Heart Rate": number;     
    "Daily Steps": number;
}

export interface QuestionarioSonoResponse {
    success: boolean;
    data: {
        requestId: string;
        resultado: number;    // 0 = Sem distúrbio, 1 = Moderado, 2 = Severo
        interpretacao: {
            nivel: string;
            descricao: string;
            gravidade: string;
        };
        recomendacoes: string[];
        dadosAnalisados: {
            dadosDemograficos: any;
            parametrosSono: any;
            saudeFisica: any;
            saudeMental: any;
        };
    };
}