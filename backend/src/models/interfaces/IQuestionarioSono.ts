export interface IQuestionarioSono {
    gender: "Male" | "Female";
    age: number;
    occupation: string;
    sleep_duration: number;
    quality_of_sleep: number;
    physical_activity_level: number;
    stress_level: number;
    bmi_category: string;
    blood_pressure: string;
    heart_rate: number;
    daily_steps: number;
    sleep_disorder?: string;
}

export interface IResultadoSono {
    resultado: number;
    recomendacao: string;
}
