import React from "react";
import {Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Typography} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers";
import {Dayjs} from "dayjs";
import {Product, Store} from "../types";
import stores from "../data/stores.json";
import products from "../data/products.json";

interface FiltersProps{
    filterStore: number[];
    filterProduct: number[];
    beginDate: Dayjs|null;
    endDate: Dayjs|null;
    handleSetFilterStore(filterStore: number[]) :void;
    handleSetFilterProduct(filterStore: number[]) :void;
    handleSetBeginDate(date: Dayjs|null): void;
    handleSetEndDate(date: Dayjs|null): void

}
export function Filters(props: FiltersProps){

    const handleSetFilter = (type: 'store' | 'product') => (event: React.ChangeEvent<HTMLInputElement>) => {
        if(type === 'store') {
            if (props.filterStore.includes(parseInt(event.target.value))) {
                props.handleSetFilterStore(props.filterStore.filter(storeId => storeId !== parseInt(event.target.value)))
            } else {
                props.handleSetFilterStore([...props.filterStore, parseInt(event.target.value)]);
            }
        }
        else if( type === 'product') {
            if (props.filterProduct.includes(parseInt(event.target.value))) {
                props.handleSetFilterProduct(props.filterProduct.filter(productId => productId !== parseInt(event.target.value)))
            } else {
                props.handleSetFilterProduct([...props.filterProduct, parseInt(event.target.value)]);
            }
        }
    }

    return(
        <Grid className="filter-container" container aria-label="Filters">
            <Typography variant="h5"> Filter By</Typography>
            <FormControl>
                <FormLabel id="stores-label">Stores</FormLabel>
                <FormGroup>
                    {stores.map((store: Store, idx)=>{
                        return <FormControlLabel
                            key={idx}
                            control={
                                <Checkbox
                                    checked={props.filterStore.includes(store.id_store)}
                                    onChange={handleSetFilter('store')}
                                    value={`${store.id_store}`}
                                    name={`${store.id_store}`}
                                />}
                            label={store.store_label}
                        />
                    })}
                </FormGroup>
            </FormControl>
            <FormControl>
                <FormLabel id="products-label">Products</FormLabel>
                <FormGroup>
                    {products.map((product: Product, idx)=>{
                        return <FormControlLabel
                            key={idx}
                            control={
                                <Checkbox
                                    checked={props.filterProduct.includes(product.id_product)}
                                    onChange={handleSetFilter('product')}
                                    value={`${product.id_product}`}
                                    name={`${product.id_product}`}
                                />}
                            label={product.name_product}
                        />
                    })}
                </FormGroup>
            </FormControl>

            <DatePicker
                label={"From"}
                value={props.beginDate}
                onChange={(newValue) => props.handleSetBeginDate(newValue)}
            />

            <DatePicker
                label={"To"}
                value={props.endDate}
                onChange={(newValue) => props.handleSetEndDate(newValue)}
            />
        </Grid>
    )
}