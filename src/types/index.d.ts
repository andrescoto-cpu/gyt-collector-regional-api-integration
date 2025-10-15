// src/types/index.d.ts

// Definición de tipos para el proyecto GYT Collector Web Service

// Interfaz para la estructura de un pago
interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
}

// Interfaz para la respuesta de la API de Akros
interface AkrosApiResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// Interfaz para la configuración del cliente Akros
interface AkrosClientConfig {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    apiUrl: string;
}

// Tipo para el manejo de errores
type ErrorResponse = {
    message: string;
    code: number;
    details?: string;
};

// Función para convertir XML a JSON
declare function xmlToJson(xml: string): Promise<any>;

// Función para convertir JSON a XML
declare function jsonToXml(json: any): Promise<string>;