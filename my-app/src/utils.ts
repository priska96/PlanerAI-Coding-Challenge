import {groupBy} from "./groupBy";
import {Delivery, ReportingViewData, Recommendation, Sales} from "./types";
import stores from "./data/stores.json";
import products from "./data/products.json";

export const dataPreprocessing = (recommendations: Recommendation[], deliveries: Delivery[], sales: Sales[]) => {
    const groupedByTargetDate = groupBy(recommendations,["target_date"]);
    const groupedByTargetDateDel = groupBy(deliveries,["target_date"]);
    const groupedByTargetDateSal = groupBy(sales,["target_date"]);

    const listOfDates = Object.keys(groupedByTargetDateDel).sort(function(a,b) {
        a = a.split('-').join('');
        b = b.split('-').join('');
        return a > b ? 1 : a < b ? -1 : 0;
    });

    const data : ReportingViewData[] = [];
    listOfDates.forEach(targetDate =>{
        const dataset : ReportingViewData = {}
        dataset['target_date'] = targetDate;
        if(targetDate in groupedByTargetDate) {
            groupedByTargetDate[targetDate].forEach(targetDateGroup => {
                const newKey = targetDateGroup.id_store + '_' + targetDateGroup.id_product + '_recommendation';
                dataset[newKey] = targetDateGroup.recommendation;
            })
        }
        groupedByTargetDateDel[targetDate].forEach(targetDateGroup => {
            const newKey = targetDateGroup.id_store + '_' + targetDateGroup.id_product + '_delivery_qty';
            dataset[newKey] = targetDateGroup.delivery_qty;
        })
        if(targetDate in groupedByTargetDateSal) {
            groupedByTargetDateSal[targetDate].forEach(targetDateGroup =>{
                const newKeySales = targetDateGroup.id_store+'_'+targetDateGroup.id_product+'_sales_qty';
                dataset[newKeySales] = targetDateGroup.sales_qty;
                const newKeyDemands = targetDateGroup.id_store+'_'+targetDateGroup.id_product+'_demand_qty';
                dataset[newKeyDemands] = targetDateGroup.demand_qty;
            })
        }
        data.push(dataset)
    })
    return data
}

export const getStoreLabelById = (id_store: string) =>{
    return stores.filter(store=> store.id_store === parseInt(id_store))[0].store_label
}

export const getProductNameById = (id_product: string) =>{
    return products.filter(product=> product.id_product === parseInt(id_product))[0].name_product
}

export const getType = (type: string) => {
    switch (type){
        case 'recommendation':
            return 'recommended ';
        case 'delivery':
            return 'delivered ';
        case 'sales':
            return 'sold ';
        case 'demand':
            return 'demanded  ';
        default:
            return ' ';
    }
}
