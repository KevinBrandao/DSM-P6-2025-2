export interface IAvaliacaoSono {
    id?: string;
    data: Date;
    resultado: number;
    recomendacao?: string;
    medicoId: string;
    questionarioId: string;
}
