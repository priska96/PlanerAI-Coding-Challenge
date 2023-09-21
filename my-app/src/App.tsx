import React from 'react';
import baeckerAILogo from './baeckerAi-logo.jpeg';
import './App.css';
import {FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Typography} from "@mui/material";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import recommendations from './data/recommendations.json'
import deliveries from './data/deliveries.json'
import sales from './data/sales.json'
import products from './data/products.json'
import stores from './data/stores.json'
import {dataPreprocessing, getProductNameById, getStoreLabelById, getType} from "./utils";
import {Payload, ReportingViewData} from "./types";



const CustomTooltip = ({ active, payload, label }: any) => {
    console.log(active, payload, label)
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="target_date">{label}</p>
                <p className="desc">
                    {(payload as Payload[]).map((activeElement, idx)=>{
                        const splitName = activeElement.dataKey.split('_');
                        return(
                            <p>
                                <span>{getStoreLabelById(splitName[0])}:</span>
                                <span>{getProductNameById(splitName[1])}:
                                    {getType(splitName[2])}{activeElement.value}</span>
                            </p>
                        )
                    })}
                </p>
            </div>
        );
    }

    return null;
};


function App() {
    const [recommData, setRecommData] = React.useState< ReportingViewData[]>([]);
    const [storeIds, setStoreIds] = React.useState<number[]>([])
    const [productIds, setProductIds] = React.useState<number[]>([])

    const [filterStore, setFilterStore] = React.useState(100790000)
    const [filterProduct, setFilterProduct] = React.useState(100700034)

    React.useEffect(()=>{
        const id_stores = stores.map(store => store.id_store);
        setStoreIds(id_stores)
        const id_products = products.map(product => product.id_product);
        setProductIds(id_products)
    },[])

    React.useEffect(()=>{
        const data = dataPreprocessing(recommendations, deliveries, sales)
        setRecommData(data.slice(0,15))
    },[])


    const handleSetFilter = (type: 'store' | 'product') => (event: React.ChangeEvent<HTMLInputElement>) => {
        if(type === 'store')
            setFilterStore(parseInt(event.target.value))
        else if( type === 'product')
            setFilterProduct(parseInt(event.target.value))
    }

  return (
    <div className="App">
      <Grid container flexDirection="column">
          <Grid className="header" container justifyContent="center" alignItems="flex-start">
              <img className="logo" src={baeckerAILogo} alt="BaeckerAILogo"/>
              <Typography className="title" variant="h2" component="h2" aria-label="Title">Reporting View</Typography>
          </Grid>
          <Grid className="filter-container" container>
              <Typography variant="h5"> Filter By</Typography>
              <FormControl>
                  <FormLabel id="stores-label">Stores</FormLabel>
                  <RadioGroup
                      aria-labelledby="stores-label"
                      value={filterStore}
                      onChange={handleSetFilter('store')}
                  >
                      {stores.map((store, idx)=>{
                          return <FormControlLabel value={store.id_store} control={<Radio />} label={store.store_label} />
                      })}
                  </RadioGroup>
              </FormControl>
              <FormControl>
                  <FormLabel id="products-label">Products</FormLabel>
                  <RadioGroup
                      aria-labelledby="products-label"
                      value={filterProduct}
                      onChange={handleSetFilter('product')}
                  >
                      {products.map((product, idx)=>{
                          return <FormControlLabel value={product.id_product} control={<Radio />} label={product.name_product} />
                      })}
                  </RadioGroup>
              </FormControl>
          </Grid>
          <Grid style={{height: 500}}>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                      width={500}
                      height={300}
                      data={recommData}
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
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend
                          formatter={(value, entry, index)=>{
                              const { color } = entry;
                              return <span style={{ color }}>{getType(value.split('_')[2])}</span>;
                          }}
                      />
                      {storeIds.filter(storeId => storeId === filterStore).map((storeId) => {
                          return productIds.filter(productId => productId === filterProduct).map(productId =>{
                              return (
                                  <>
                                      <Bar key={`${storeId}_${productId}_rec`} dataKey={`${storeId}_${productId}_recommendation`} fill="#8884d8" />
                                      <Bar key={`${storeId}_${productId}_del`} dataKey={`${storeId}_${productId}_delivery_qty`} fill="#82ca9d" />
                                      <Bar key={`${storeId}_${productId}_sal`} dataKey={`${storeId}_${productId}_sales_qty`} fill="#ffc658" />
                                      <Bar key={`${storeId}_${productId}_dem`} dataKey={`${storeId}_${productId}_demand_qty`} fill="#ff7300" />
                                  </>
                              )
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
