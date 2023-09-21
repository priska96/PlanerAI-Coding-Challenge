export interface ReportingViewData {
    [key: string]: number| string
}
export interface Recommendation {
    "target_date": string,
    "id_store": number,
    "id_product": number,
    "recommendation": number,
    "recommendation_value_by_price": number
}

export interface Delivery {
    "target_date": string,
    "id_store": number,
    "id_product": number,
    "delivery_qty": number,
    "delivery_value_by_price": number
}

export interface Sales {
    "target_date": string,
    "id_store": number,
    "id_product": number,
    "sales_qty": number,
    "sales_value": number,
    "demand_qty": number,
    "demand_value": number
}

export interface Store {
    "id_store": number,
    "store_label": string,
    "number_store": number
}

export interface Product {
    "id_product": number,
    "name_product": string,
    "number_product": number,
    "price": number
}
export interface Payload {
    chartType: string | undefined;
    color: string
    dataKey: string;
    fill: string;
    formatter: undefined
    name: string;
    payload: Object;
    type: string | undefined;
    unit: string | undefined;
    value: string | number | undefined;
}

export interface ColorScheme{
    [key: string]: string
}