import { ContractReceipt } from "ethers";
import { EVENT_ENTITY_MINTED, EVENT_MINT_REWARD_CLAIMED } from "../types/DarkBitsTypes";


export const parseTopicsFromReceipt = (isLiveInstance: boolean, reciept: ContractReceipt, eventName: string): string[] => {
    if (!isLiveInstance) {
        return parseForVerifiedReceiptEventTopics(reciept, eventName);

    } else  {
        // defaulting to unverified contract receipt data parsing for now
        switch (eventName) {
            case EVENT_ENTITY_MINTED :
                return parseForUnverifiedReceiptMintEventTopics(reciept);

            case EVENT_MINT_REWARD_CLAIMED :
                return parseForUnverifiedReceiptClaimEventTopics(reciept);
            default: 
                return [];
        }
    }
}

export const parseForUnverifiedReceiptMintEventTopics = (reciept: ContractReceipt): string[] => {
    if(!reciept.events || reciept.events.length === 0){
        return [];
    }
    if(!reciept.events[2] || reciept.events[2].topics.length !== 4){
        return [];
    }
    return reciept.events[2].topics;
}

export const parseForUnverifiedReceiptClaimEventTopics = (reciept: ContractReceipt): string[] => {
    if(!reciept.events || reciept.events.length === 0){
        return [];
    }
    const lastIndex = reciept.events.length - 1;
    return reciept.events[lastIndex].topics;
}

export const parseForVerifiedReceiptEventTopics = (reciept: ContractReceipt, eventName:string): string[] => {
    let topics:string[] = [];

    if(!reciept.events || reciept.events.length === 0){
        return [];
    }

    reciept.events.map((event) => {
        if(!event.event){
            return;
        }
        if(event.event?.indexOf(eventName) > -1){
            topics = event.topics;
        }
    });
    return topics;
}