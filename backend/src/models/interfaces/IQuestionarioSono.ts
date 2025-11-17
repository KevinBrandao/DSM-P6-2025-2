export interface IQuestionarioSono {
    id?: string;
    nome: string;
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
    createdAt?: Date;
    updatedAt?: Date;
}