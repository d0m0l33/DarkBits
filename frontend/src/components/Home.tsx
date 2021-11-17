import { Contract, ContractReceipt, ContractTransaction, ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { mainnetAddress, polygonAddress, polygonForkAddress } from '../addresses/addresses';
import { CurrentAddressContext, DarkEtherContext, DarkBitsContext, SignerContext, SymfoniContext, SymfoniDarkEther, SymfoniDarkBits } from "../hardhat/SymfoniContext";
import { EVENT_ENTITY_MINTED, EVENT_MINT_REWARD_CLAIMED, MINT_MESSAGE_FRAGMENTS } from '../types/DarkBitsTypes';
import { DevNets, validChainIds } from '../types/NetworkTypes';
import { parseTopicsFromReceipt } from '../utils/EventParser';
import { currentNetwork, getCorrectDarkBitsInstance, isLiveInstance } from '../utils/InstanceHelper';
import { DarkBitsInterface } from './DarkBitsInterface';

const DarkBitsAddress = polygonAddress.DarkBits;
const mintPrice = '2';
interface Props { }

export const Home: React.FC<Props> = () => {
    const [showMintAlert, setShowMintAlert] = useState(false);
    const [showClaimAlert, setShowClaimAlert] = useState(false);
    const [showMintingLoader, setShowMintingLoader] = useState(false);
    const [showClaimingLoader, setShowClaimingLoader] = useState(false);
    const [isRewardAvailable, setRewardAvailability] = useState(false);
    const [mintSuccessMessage, setMintSuccessMessage] = useState("");
    const [claimSuccessMessage, setClaimSuccessMessage] = useState("");

    const [chainId, setChainId] = useState(0);
    const [signer] = useContext(SignerContext);
    const [currentAddress, setCurrentAddress] = useContext(CurrentAddressContext);
    let mountedRef = true;
    const darkBitsEthereum: SymfoniDarkEther  = useContext(DarkEtherContext);
    const darkBits: SymfoniDarkBits  = useContext(DarkBitsContext);
    const initContract = (liveAddress:string): Contract => {
        return  new ethers.Contract(liveAddress, DarkBitsInterface ,signer);
    }
    const [darkBitsLive, setContract] = useState(initContract(DarkBitsAddress));

    useEffect(() => {
        if(!window.ethereum){
            return;
        }
        window.ethereum.on('accountsChanged',  (accounts: any[]) => {    
            if(accounts[0] !== currentAddress) {
                setCurrentAddress(accounts[0]);
                if(accounts! || !accounts[0] || accounts[0].length === 0){
                    window.location.reload();
                }
            }
        }).on('chainChanged', () => {
            window.location.reload();
        });
    });

    useEffect(() => {
        const doAsync = async () => {
            if(!signer){
                return;
            }
            let id = await signer?.getChainId();
            if(!id){return}
            setChainId(id);
            if(currentNetwork == DevNets.polygon ) {
                if (!darkBitsLive) return;
                if(isCorrectChainId()) {
                    handleGetData();
                }
            } else if(currentNetwork == DevNets.polygonFork ) {
                if (!darkBits.instance) return
                if(isCorrectChainId()) {
                    handleGetData();
                }
            }
            else {
                if (!darkBitsEthereum.instance) return
                if(isCorrectChainId()) {
                    handleGetData();
                }
            }
        };
        if(mountedRef) {
            doAsync();
        }
        return () => {
            mountedRef = false;
          };    
        }, [darkBitsEthereum, chainId,mountedRef]);


    const isCorrectChainId = (): boolean => {
        return chainId === validChainIds[currentNetwork];
    }

    const blockAllActions = (): boolean => {
        return !isCorrectChainId();
    }

    const handleGetData = async () => {
        let darkBitsContract:Contract|null = getCorrectDarkBitsInstance(
            darkBitsEthereum,
            darkBits,
            darkBitsLive
        );
        if(!darkBitsContract){
            return;
        }
        const rewardCheck =  await darkBitsContract.getRewardAvailability();
        setRewardAvailability(rewardCheck);
    }

    const parseForEventData = (reciept: ContractReceipt, eventName:string): boolean => {
        let topics: string[] = [];
        let topicsFound = false;
        switch (eventName) {
            case EVENT_ENTITY_MINTED :
                topics = parseTopicsFromReceipt(isLiveInstance(), reciept, eventName);
                if(topics.length === 0) {
                    break;
                }
                topicsFound = true;
                const decodedClass = ethers.utils.defaultAbiCoder.decode(['uint256'], topics[2]);
                const parsedClass = parseFloat(decodedClass.toString());
                const amount = ethers.utils.defaultAbiCoder.decode(['uint256'], topics[3]);
                const mintMessage = `You just minted ${MINT_MESSAGE_FRAGMENTS[parsedClass]} with a balance of ${amount}`;
                setMintSuccessMessage(mintMessage);
                break;
            case EVENT_MINT_REWARD_CLAIMED :
                topics = parseTopicsFromReceipt(isLiveInstance(), reciept, eventName);
                if(topics.length === 0) {
                    break;
                }
                topicsFound = true;
                const amountClaimed = ethers.utils.defaultAbiCoder.decode(['uint256'], topics[2]).toString();
                const formattedAmountClaimed = parseFloat(amountClaimed)/(10 ** 18);
                const claimMessage = `You just claimed ${formattedAmountClaimed} amWMATIC(AAVE).`;
                setClaimSuccessMessage(claimMessage);
                break;    
            default:
        }
        return topicsFound;
    }

    const handleMint = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        clearAllModals();

        if(!currentAddress || currentAddress === undefined){
            return;
        }
        let darkBitsContract:Contract|null = getCorrectDarkBitsInstance(
            darkBitsEthereum,
            darkBits,
            darkBitsLive
        );
        if(!darkBitsContract){
            return;
        }
        let overrides = {
            value: ethers.utils.parseEther(mintPrice)    
        };
        let mintTransaction: any;
        setShowMintingLoader(true);
        const tx:any = darkBitsContract.requestMint(overrides).then( async(response: ContractTransaction) => {
            mintTransaction = await response.wait();
            return Promise.resolve(mintTransaction);
        }).catch(() => {
            mintTransaction = null;
            return Promise.resolve(mintTransaction);
        })
        await Promise.all([tx]);
        setShowMintingLoader(false);
        if(!mintTransaction){
            return;
        }
        const hasEntityMintedTopic = parseForEventData(mintTransaction, EVENT_ENTITY_MINTED); 
        if(hasEntityMintedTopic == true) {
            setShowMintAlert(true);
        } 
        
    }

    const handleClaim = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        clearAllModals();  
        let claimTransaction: any;
        let darkBitsContract:Contract|null = getCorrectDarkBitsInstance(
            darkBitsEthereum,
            darkBits,
            darkBitsLive
        );
        if(!darkBitsContract){
            return;
        }
        setShowClaimingLoader(true);
        const tx:any = darkBitsContract.claimMintReward().then( async(response: ContractTransaction) => {
            claimTransaction = await response.wait();
            return Promise.resolve(claimTransaction);
        }).catch(() => {
            claimTransaction = null;
            return Promise.resolve(claimTransaction);
        })
        await Promise.all([tx]);
        setShowClaimingLoader(false);
        if(!claimTransaction){
            return;
        }
        const hasEntityClaimedTopic = parseForEventData(claimTransaction, EVENT_MINT_REWARD_CLAIMED); 
        if(hasEntityClaimedTopic == true) {
            setShowClaimAlert(true);
        } 
    
    }

    const clearAllModals = () => {
        setShowMintAlert(false);
        setShowClaimAlert(false);
    }

    return (
        <div style={{marginTop:'1em'}}>
            <Container>
                <Row style={{marginBottom:'1em'}}>
                    {showClaimingLoader === true ?    <Col>
                        <div style={{marginBottom:'0.5em',color: '#77bb44'}}>Claiming</div>
                        <Spinner style={{color: '#77bb44'}} animation="grow" />
                    </Col> : ''}
                    {showMintingLoader === true ?    <Col>
                        <div style={{marginBottom:'0.5em',color: '#77bb44'}}>Minting</div>
                        <Spinner style={{color: '#77bb44'}} animation="grow" />
                    </Col> : ''}
                </Row>
                <Row>
                <Col>
                    <div></div>
                </Col>

                <Col xs={12} sm={12} md={6} lg={6}>
                    <Alert variant="success" show={showMintAlert}  onClose={() => setShowMintAlert(false)} dismissible>
                    <Alert.Heading> Mint Success !</Alert.Heading>
                        <p>
                        {mintSuccessMessage}
                        </p>
                        <p>See<a style={{textDecoration: 'none'}} href="#/viewTokens"> View Tokens</a></p>
                    </Alert>
                    <Alert variant="primary" show={showClaimAlert}  onClose={() => setShowClaimAlert(false)} dismissible>
                    <Alert.Heading> Claim Success !</Alert.Heading>
                        <p>
                        {claimSuccessMessage}
                        </p>
                    </Alert>
                </Col>

                <Col>
                    <div></div>
                </Col>
                </Row>
                <Row>
                    <Col>
                        <Button
                        disabled={blockAllActions()} 
                        style={{marginRight:'0.5em',borderColor: '#77bb44', color:'#77bb44'}} 
                        variant="outline-light" size="lg" 
                        onClick={(e) => handleMint(e)}>Mint</Button>

                        <Button  
                        aria-hidden={true}
                        disabled={!isRewardAvailable || blockAllActions()} 
                        style={{marginRight:'0.5em',borderColor: '#77bb44', color:'#77bb44'}}  
                        variant="outline-light" size="lg" 
                        onClick={(e) => handleClaim(e)}>Claim</Button>
                    </Col>
                </Row>
                {blockAllActions() ?  <Row style={{marginTop:'0.5em'}} >
                    <b style={{color: '#77bb44'}}>Must be connected to Polygon Mainnet.</b>
                </Row> : '' }
            </Container>
        </div>
    )
}



