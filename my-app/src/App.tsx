import React from 'react';
import {Grid, Typography} from "@mui/material";
import {Bar, BarChart, CartesianGrid, Legend, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import dayjs, {Dayjs} from "dayjs";
import CustomTooltip from "./components/CustomTooltip";
import CustomLegend from "./components/CustomLegend";
import {Filters} from "./components/Filters";
import {
    colorScheme,
    dataPreprocessing,
    determineImprovementDeterioration2,
} from "./utils";
import {ReportingViewData} from "./types";
import recommendations from './data/recommendations.json'
import deliveries from './data/deliveries.json'
import sales from './data/sales.json'
import products from './data/products.json'
import stores from './data/stores.json'
import baeckerAILogo from './baeckerAi-logo.jpeg';
import './App.css';

function App() {
    const [reportData, setReportData] = React.useState< ReportingViewData[]>([]);
    const [storeIds, setStoreIds] = React.useState<number[]>([])
    const [productIds, setProductIds] = React.useState<number[]>([])

    const [filterStore, setFilterStore] = React.useState([100790000])
    const [filterProduct, setFilterProduct] = React.useState([100700034])

    const [beginDate, setBeginDate] = React.useState<Dayjs | null>(dayjs());
    const [endDate, setEndDate] = React.useState<Dayjs | null>(dayjs());

    const [markers, setMarkers] = React.useState< ReportingViewData[]>([]);
    React.useEffect(()=>{
        const id_stores = stores.map(store => store.id_store);
        setStoreIds(id_stores)
        const id_products = products.map(product => product.id_product);
        setProductIds(id_products)
    },[])

    React.useEffect(()=>{
        const data = dataPreprocessing(recommendations, deliveries, sales, beginDate, endDate)
        setReportData(data)
    },[beginDate, endDate])

    React.useEffect(()=>{
        const result = reportData.map((dataset)=>{
            return determineImprovementDeterioration2(dataset, filterStore, filterProduct)
        })
        setMarkers(result)
    },[reportData, filterStore, filterProduct])


  return (
    <div className="App">
      <Grid container flexDirection="column">
          <Grid className="header" container justifyContent="center" alignItems="center" aria-label="Header">
              <img className="logo" src={baeckerAILogo} alt="BaeckerAILogo" aria-label="Logo"/>
              <Typography className="title" variant="h2" component="h2" aria-label="Title">Reporting View</Typography>
          </Grid>
          <Filters
              filterStore={filterStore}
              filterProduct={filterProduct}
              beginDate={beginDate}
              endDate={endDate}
              handleSetFilterStore={setFilterStore}
              handleSetFilterProduct={setFilterProduct}
              handleSetBeginDate={setBeginDate}
              handleSetEndDate={setEndDate}
          />
          <Grid style={{height: 500}}
                aria-label="Chart">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                      width={500}
                      height={300}
                      data={reportData}
                      margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                      }}
                  >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="target_date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />}/>
                      <Legend content={<CustomLegend />} />
                      {storeIds.filter(storeId => filterStore.includes(storeId)).map((storeId) => {
                          return productIds.filter(productId => filterProduct.includes(productId)).map(productId =>{
                              return (
                                  <>
                                      <Bar key={`${storeId}_${productId}_rec`} dataKey={`${storeId}_${productId}_recommendation`} fill={colorScheme.recommended} />
                                      <Bar key={`${storeId}_${productId}_del`} dataKey={`${storeId}_${productId}_delivery_qty`} fill={colorScheme.delivered} />
                                      <Bar key={`${storeId}_${productId}_sal`} dataKey={`${storeId}_${productId}_sales_qty`} fill={colorScheme.sold} />
                                      <Bar key={`${storeId}_${productId}_dem`} dataKey={`${storeId}_${productId}_demand_qty`} fill={colorScheme.demanded} />
                                  </>
                              )
                          })
                      })}
                      {markers.map((marker, idx) => {
                          if(Object.keys(marker).length === 1) return null;
                          return Object.keys(marker).map((key, index)=>{
                              const splitName= key.split('_')
                              return <ReferenceDot
                                  key={`${idx}-${index}`}
                                  x={marker.target_date}
                                  y={marker[key]}
                                  label={splitName[3]}
                                  r={3} fill={splitName[3] === 'improved'? 'green' : 'red' } stroke="none"
                              />

                          })
                      })}
                  </BarChart>
              </ResponsiveContainer>
          </Grid>

      </Grid>
    </div>
  );
}

export default App;
