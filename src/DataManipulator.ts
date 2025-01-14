import { ServerRespond } from './DataStreamer';

//updated row schema so that it matches the new schema 

//processing row data that is received from server using serverRespond
//prepares object to be returned by generateRow function

export interface Row {
  price_abc: number,
  price_def: number,
  ratio:number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}
export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]) : Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;

    const ratio = priceABC/priceDEF;

    //these bounds help traders visualize when the ratio is going far off from its historical average
    const upperBound = 1 + 0.07;
    const lowerBound = 1 - 0.07;

    
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? 
        serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound:upperBound,
      lower_bound:lowerBound,
      trigger_alert: (ratio> upperBound || ratio < lowerBound) ? ratio : undefined,
      };
  }
}
