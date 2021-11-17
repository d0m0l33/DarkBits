import { Contract } from "ethers";
import { SymfoniDarkEther, SymfoniDarkBits } from "../hardhat/SymfoniContext";
import { DevNets } from "../types/NetworkTypes";

export let currentNetwork = DevNets.polygon;

export const getCorrectDarkBitsInstance =(
    ethereumInstance:SymfoniDarkEther, 
    polygonInstance: SymfoniDarkBits,
    liveInstance:Contract ): Contract|null=> {
    let darkEtherContract:Contract|null = null;
    if (!isLiveInstance()) { 
        if(ethereumInstance.instance && !isNullAddress(ethereumInstance.instance.address)){
            darkEtherContract = ethereumInstance.instance;
        } else if (polygonInstance.instance && !isNullAddress(polygonInstance.instance.address)) {
            darkEtherContract = polygonInstance.instance;
        }
    }
    else {
        darkEtherContract = liveInstance;
    }
    return darkEtherContract;
}


export const isLiveInstance = (): boolean => {
    return currentNetwork === DevNets.main || 
    currentNetwork === DevNets.polygon ||
    currentNetwork === DevNets.kovan ||
    currentNetwork === DevNets.rinkeby
}

const isNullAddress = (address: string): boolean => {
    return address === '0x0000000000000000000000000000000000000000';
}
