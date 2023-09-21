import {groupBy} from "./groupBy";
import {Delivery, ReportingViewData, Recommendation, Sales, ColorScheme, Payload} from "./types";
import stores from "./data/stores.json";
import products from "./data/products.json";
import {Dayjs} from "dayjs";

export const dataPreprocessing = (recommendations: Recommendation[], deliveries: Delivery[], sales: Sales[], beginDate: Dayjs | null, endDate: Dayjs | null, ) => {
    const groupedByTargetDate = groupBy(recommendations,["target_date"]);
    const groupedByTargetDateDel = groupBy(deliveries,["target_date"]);
    const groupedByTargetDateSal = groupBy(sales,["target_date"]);

    const listOfDates = Object.keys(groupedByTargetDateDel).sort(function(a,b) {
        a = a.split('-').join('');
        b = b.split('-').join('');
        return a > b ? 1 : a < b ? -1 : 0;
    });
    let beginIdx = 0;
    if(beginDate) {
        const beginDateStr = beginDate.format('YYYY-MM-DD');
        beginIdx = listOfDates.findIndex( date => date === beginDateStr)
        beginIdx = beginIdx > -1 ? beginIdx : 0
    }
    let endIdx = listOfDates.length
    if(endDate) {
        const endDateStr = endDate.format('YYYY-MM-DD');
        endIdx = listOfDates.findIndex(date => date === endDateStr)
        endIdx = endIdx > -1 ? endIdx : listOfDates.length
    }
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
    return data.slice(beginIdx,endIdx)
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

export const colorScheme: ColorScheme = {
    recommended: '#8884d8',
    delivered: '#82ca9d',
    sold: '#ffc658',
    demanded: '#ff7300'
}

export const determineImprovementDeterioration = (items: Payload[]) =>{
    const deliveredItems = items.filter(item => item.dataKey.indexOf('delivery_qty') > 0)
    const winners: string[] = [];
    const losers: string[] = [];
    const message: string[] = [];
    deliveredItems.forEach((item, idx)=> {
        const splitName = item.dataKey.split('_');
        const storeProduct = splitName[0] + '_' + splitName[1];
        const recommendation = items.filter(item => item.dataKey === storeProduct + '_recommendation');
        const delivery = items.filter(item => item.dataKey === storeProduct + '_delivery_qty');
        const demands = items.filter(item => item.dataKey === storeProduct + '_demand_qty');
        if (recommendation.length > 0 && delivery.length > 0 && demands.length > 0) {
            const delivered = delivery[0].value && typeof (delivery[0].value) === 'number' ? delivery[0].value : 0;
            const recommended = recommendation[0].value && typeof (recommendation[0].value) === 'number' ? recommendation[0].value : 0;
            const demanded = demands[0].value && typeof (demands[0].value) === 'number' ? demands[0].value : 0;

            const diffRec = demanded - recommended;
            const diffDel = demanded - delivered;
            if (recommendationWasDeteriorated(diffRec, diffDel)) {
                losers.push(storeProduct + '_delivery_qty')
                const amount = Math.abs(diffRec - diffDel)
                message.push(`${amount} product${amount > 1 ? 's': ''} could have been saved!`)
            } else if (recommendationWasDeterioratedButStillWaste(diffRec, diffDel)) {
                losers.push(storeProduct + '_delivery_qty')
                const amount = Math.abs(diffRec - diffDel)
                const amount2 = Math.abs(diffRec)
                message.push(
                    `${amount} product${amount > 1 ? 's': ''} could have been saved! 
                    But ${amount2} product${amount2 > 1 ? 's': ''} would have still been wasted.`
                )
            } else if (recommendationWasImprovedButNotSatisfied(diffRec, diffDel)) {
                winners.push(storeProduct + '_delivery_qty')
                const amount = Math.abs(diffRec)
                const amount2 = Math.abs(diffDel)
                message.push(
                    `${amount} product${amount > 1 ? 's': ''} ${amount > 1 ? 'were': 'was'} saved! 
                But ${amount2} demand${amount2 > 1 ? 's': ''} ${amount2 > 1 ? 'were': 'was'} not satisfied.`)
            }
            else if (recommendationWasImprovedButStillWaste(diffRec, diffDel)) {
                winners.push(storeProduct + '_delivery_qty')
                const amount = Math.abs(diffRec - diffDel)
                const amount2 = Math.abs(diffDel)
                message.push(
                    `${amount} product${amount > 1 ? 's': ''} would have been saved! 
                    But ${amount2} product${amount2 > 1 ? 's': ''} would have still been wasted.`
                )
            }
        }
    })
    return { winners: winners, losers: losers, message: message}
}

const recommendationWasDeteriorated = (diffRec: number, diffDel: number) => {
    return Math.abs(diffRec) < Math.abs(diffDel) && diffDel < 0 && diffRec >= 0
}
const recommendationWasDeterioratedButStillWaste = (diffRec: number, diffDel: number) => {
    return Math.abs(diffRec) < Math.abs(diffDel) && diffDel < 0 && diffRec < 0
}
const recommendationWasImprovedButNotSatisfied = (diffRec: number, diffDel: number) => {
    return diffDel > 0 && diffDel > diffRec && diffRec !== 0
}
const recommendationWasImprovedButStillWaste = (diffRec: number, diffDel: number) => {
    return diffRec < diffDel && diffDel < 0 && diffRec < 0
}
export const determineImprovementDeterioration2 = (items: ReportingViewData, filterStore: number[], filterProduct: number[]) =>{
    const deliveredItems = Object.keys(items).filter(key => key.indexOf('delivery_qty') > 0)
    const result : ReportingViewData = {
        target_date: items.target_date
    }

    deliveredItems.forEach((item, idx)=> {
        const splitName = item.split('_');
        const storeProduct = splitName[0] + '_' + splitName[1];
        if(!(filterStore.includes(parseInt(splitName[0])) && filterProduct.includes(parseInt(splitName[1])))){
            return result
        }
        const recommendation = Object.keys(items).filter(key => key === storeProduct + '_recommendation');
        const delivery = Object.keys(items).filter(key => key === storeProduct + '_delivery_qty');
        const demands = Object.keys(items).filter(key => key === storeProduct + '_demand_qty');
        if (recommendation.length > 0 && delivery.length > 0 && demands.length > 0) {
            const delivered = items[delivery[0]] ? items[delivery[0]] as number  : 0;
            const recommended = items[recommendation[0]]  ? items[recommendation[0]]as number : 0;
            const demanded = items[demands[0]] ? items[demands[0]]as number : 0;

            const diffRec = demanded - recommended;
            const diffDel = demanded - delivered;
            // if (diffRec < diffDel) {
            //     result[storeProduct + '_recommendation_deteriorated'] = delivered;
            // } else if (diffRec > diffDel) {
            //     result[storeProduct + '_recommendation_improved'] = delivered;
            // }


            if (recommendationWasDeteriorated(diffRec, diffDel) || recommendationWasDeterioratedButStillWaste(diffRec, diffDel)) {
                result[storeProduct + '_recommendation_deteriorated'] = delivered;
            } else if (recommendationWasImprovedButNotSatisfied(diffRec, diffDel) ||recommendationWasImprovedButStillWaste(diffRec, diffDel)) {
                result[storeProduct + '_recommendation_improved'] = delivered;
            }

        }
    })
    return result
}
