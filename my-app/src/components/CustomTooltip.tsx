import React from "react";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {determineImprovementDeterioration, getProductNameById, getStoreLabelById, getType} from "../utils";
import {Payload} from "../types";

export default function CustomTooltip({ active, payload, label}: any){
    const [markWinner, setMarkWinner] = React.useState<string[]>([]);
    const [markLoser, setMarkLoser] = React.useState<string[]>([]);
    const [message, setMessage] = React.useState<string[]>([]);

    React.useEffect(()=>{
        if (active && payload && payload.length){
            const result = determineImprovementDeterioration((payload as Payload[]))
            setMarkWinner(result.winners)
            setMarkLoser(result.losers)
            setMessage(result.message)
        }
    },[active, payload])

    if (active && payload && payload.length) {

        return (
            <div className="custom-tooltip">
                <p className="target_date">{label}</p>
                <p className="desc">
                    {message.length > 0 ? <span className="conclusion">{message.join(' ')}</span> : null}
                    {(payload as Payload[]).map((activeElement, idx)=>{
                        const splitName = activeElement.dataKey.split('_');
                        return(
                            <span key={idx}>
                                <span className="store-name">{getStoreLabelById(splitName[0])}: </span>
                                <span className="product-name">
                                    {getProductNameById(splitName[1])}:
                                    <span
                                        className="type"
                                        style={{
                                            color: activeElement.color,
                                            fontWeight: markWinner.includes(activeElement.dataKey) || markLoser.includes(activeElement.dataKey)  ? 'bold' : 'normal'
                                        }}
                                    > {getType(splitName[2])}{activeElement.value}
                                        {markWinner.includes(activeElement.dataKey) ?
                                            <ThumbUpIcon
                                                style={{backgroundColor: activeElement.color }}
                                                className="markerIcon"
                                            />
                                            : null}
                                        {markLoser.includes(activeElement.dataKey) ?
                                            <ThumbDownIcon
                                                style={{backgroundColor: activeElement.color }}
                                                className="markerIcon"
                                            />
                                            : null}
                                    </span>
                                </span>
                                <br/>
                            </span>
                        )
                    })}
                </p>
            </div>
        );
    }
    return null;
};