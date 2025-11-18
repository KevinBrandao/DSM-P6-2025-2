export interface IQuestionario {
    nome: string;
    age: number;
    sex: number;
    chestPainType: number;
    restingBloodPressure: number;
    serumCholesterol: number;
    fastingBloodSugar: number;
    restingECG: number;
    maxHeartRate: number;
    exerciseAngina: number;
    oldpeak: number;
    stSlope: number;
}

export interface IResultado {
    predicao: number;
    recomendacao: string;
}

export interface IAvaliacao {
    id: number;
    data: string;
    resultado: number;
    questionario: IQuestionario;
}

export interface IQuestionarioSono {
    id?: number;
    nome?: string;
    gender: number;
    age: number;
    occupation: string;
    sleepDuration: number;
    qualityOfSleep: number;
    physicalActivityLevel: number;
    stressLevel: number;
    bmiCategory: string;
    bloodPressure: string;
    heartRate: number;
    dailySteps: number;
    sleepDisorder?: string;
}

export interface IResultadoSono {
    predicao: number;
    scoreQualidade: number;
    recomendacao: string;
    disturbiosIdentificados: string[];
}

export interface IAvaliacaoSono {
    id: number;
    data: string;
    questionario: IQuestionarioSono;
    resultado: IResultadoSono;
}