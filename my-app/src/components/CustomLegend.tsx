import React from "react";
import {Props as LegendProps} from "recharts/types/component/Legend";
import {Grid} from "@mui/material";
import {colorScheme} from "../utils";

export default function CustomLegend(props: LegendProps){
    if (props) {
        return (
            <div
                className="custom-legend"
                style={{
                    textAlign: props.align,
                    marginTop: props.margin && props.margin.top? props.margin.top : 0,
                    marginLeft: props.margin && props.margin.left? props.margin.left :0,
                    marginRight: props.margin && props.margin.right? props.margin.right : 0,
                    marginBottom: props.margin && props.margin.bottom? props.margin.bottom : 0
            }}>
                <Grid container justifyContent="center" columnGap={10}>
                    {Object.keys(colorScheme).map((colorCode, idx) =>{
                        return(
                            <span key={idx} className="legend-colors">
                                <span style={{backgroundColor: colorScheme[colorCode], width:props.iconSize, height:props.iconSize, marginRight: 5}}></span>
                                <span style={{color: colorScheme[colorCode]}}>{colorCode}</span>
                            </span>
                        )
                    })}
                </Grid>
            </div>
        );
    }
    return null;
};