import { Contract, ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { mainnetAddress, polygonAddress, polygonForkAddress } from '../addresses/addresses';
import { CurrentAddressContext, DarkEtherContext, DarkBitsContext, SignerContext, SymfoniContext, SymfoniDarkEther, SymfoniDarkBits } from "../hardhat/SymfoniContext";
import { DarkEther } from '../hardhat/typechain/DarkEther';
import { Entity } from '../types/DarkBitsTypes';
import { DevNets, validChainIds } from '../types/NetworkTypes';
import { currentNetwork, getCorrectDarkBitsInstance } from '../utils/InstanceHelper';
import { DarkBitsInterface } from './DarkBitsInterface';


const DarkBitsAddress = polygonAddress.DarkBits;
interface Props { }

export const Operator: React.FC<Props> = () => {
    let entities: Entity[] = [];
    const {  init } = useContext(SymfoniContext)
    const [currentAddress, setCurrentAddress] = useContext(CurrentAddressContext)
    let [darkBitsEntities, setEntities] = useState(entities);
    let [targetEntity, setTargetEntity] = useState(entities[0]);
    let [mintsForAddress, setMintsForAddress] = useState(0);
    let darkBitsEthereum:SymfoniDarkEther  = useContext(DarkEtherContext);
    const darkBits: SymfoniDarkBits  = useContext(DarkBitsContext);
    const [signer] = useContext(SignerContext);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = (entity:Entity) => {
        setTargetEntity(entity);
        setShow(true);
    };
    const [recipientAddress, setRecipientAddress] = useState("");
    const [recipientAmount, setRecipientAmount] = useState(0);
    const [totalMintsForNetwork, setTotalMintsForNetwork] = useState(0);
    const [chainId, setChainId] = useState(0);
    let mountedRef = true;
    const initContract = (liveAddress:string): Contract => {
        return  new ethers.Contract(liveAddress,DarkBitsInterface,signer);
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
            let id = await signer.getChainId();
            if(!id){return}
            if(currentNetwork == DevNets.polygon ) {
                if (!darkBitsLive) return;
            
                setChainId(id);
                if(isCorrectChainId()) {
                    handleGetData(currentAddress);
                }
            } else if(currentNetwork == DevNets.polygonFork ) {
                if (!darkBits.instance) return
                setChainId(id);
                if(isCorrectChainId()) {
                    handleGetData(currentAddress);
                }
            }
            
            else {
                if (!darkBitsEthereum.instance) return;
                setChainId(id);
                if(isCorrectChainId()) {
                    handleGetData(currentAddress);
                }
            }
        };
        if(mountedRef === true) {
            doAsync();
        }
        return () => {
            mountedRef = false;
          };
    }, [darkBitsEthereum, chainId, darkBitsEntities, mountedRef]);



    const isCorrectChainId = (): boolean => {
        return chainId === validChainIds[currentNetwork];
    }

    const blockAllActions = (): boolean => {
        return !isCorrectChainId();
    }

    const handleGetData = async (signerAddress: string) => {
        if(darkBitsEntities && darkBitsEntities.length > 0){
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
        const defaultNames =  await darkBitsContract.getDefaultNames();
        let batchAddresses = [];
        let batchIds = [];
        const formattedBatchBalances = [];
        for(let i=0;i<11;i++){
            batchAddresses.push(signerAddress);
            batchIds.push(i);
        }
        const batchBalances =  await darkBitsContract.balanceOfBatch(batchAddresses,batchIds);
        for(let i=0;i<11;i++){
            const bnBalance = ethers.utils.formatEther(batchBalances[i])
            const balance = (parseFloat(bnBalance) * 10 ** 18);
            formattedBatchBalances.push(balance);
        }
        const mintCount =  await darkBitsContract.getMintsForAddress(signerAddress);
        const formattedMintCount = parseFloat(ethers.utils.formatEther(mintCount)) * 10 ** 18;
        setMintsForAddress(formattedMintCount);
        setEntities(getEntities(defaultNames,formattedBatchBalances));
        const mintsForNetwork =  await darkBitsContract.mintCounter();
        if(!mintsForNetwork){
            return;
        }
        const formattedMintsForNetwork = parseFloat(ethers.utils.formatEther(mintsForNetwork))* 10 ** 18;
        setTotalMintsForNetwork(formattedMintsForNetwork);      
    }

    const getEntities = (darkBitsNames: string[], balances: number[]): Entity[] => {
        if(darkBitsNames.length !== balances.length){
            return [];
        }
        let entities: Entity[] = [];
        darkBitsNames.forEach((name: string, index:number) => {
            entities.push({name: name, balance: balances[index], id: index});
        });
        return entities;
    }


    const handleSetRecipientAddress = async (e: any) => {
        e.preventDefault()
        if(!e.target.value){
            return;
        }
        if(e.target.value.length === 0){
            return;
        }
 
        setRecipientAddress(e.target.value);
    }


    const handleSetRecipientAmount = async (e: any) => {
        e.preventDefault()
        if(!e.target.value){
            return;
        }
        if(e.target.value.length === 0){
            return;
        }
        if(e.target.value  < 0){
            return;
        }
        setRecipientAmount(e.target.value);
    }

    const handleSendDarkBits = async () => {
        let darkBitsContract:Contract|null = getCorrectDarkBitsInstance(
            darkBitsEthereum,
            darkBits,
            darkBitsLive
        );
        if(!darkBitsContract){
            return;
        }
        if(!recipientAddress || recipientAddress.length === 0 ){
            return;
        }
        if(!recipientAmount){
            return;
        }
        if(!targetEntity){
            return;
        }
        const amount = recipientAmount.toString();
        const id = targetEntity?.id;
        const approveTx = await darkBitsContract.setApprovalForAll(recipientAddress,true);
        await approveTx.wait();
        const sendTx = await darkBitsContract.safeTransferFrom(
            currentAddress,
            recipientAddress,
            id,
            amount,
            ethers.utils.arrayify(0));
    
        await sendTx.wait();
        handleClose();
        init();
    }

    return (            
            <Container>
                <div style={{marginTop:'1em'}}></div>
                <Row>
                    <Col
                      xs={12}
                      sm={12}
                      md={4}
                      lg={4}
                      xl={3}
                    >
                        <Card
                            bg={'dark'}
                            text={'light'}
                            className="mb-2"
                            border="light"
                        >
                            <Card.Header>
                                Operator
                                <i className="bi bi-person-fill" style={{marginLeft:'0.5em'}}></i>
                            </Card.Header>
                            <Card.Body>
                            <Card.Title>{currentAddress?.length > 0 ? 'Connected as' : 'Not Connected'}</Card.Title>
                    
                            <Card.Text >
                            {currentAddress}
                        </Card.Text>

                        <Card.Text style={{color:'#77bb44'}}>
                        {currentAddress?.length > 0 ? `Mints : ${mintsForAddress.toFixed()}` : ''}
                        </Card.Text>

                            </Card.Body>
                        </Card>
                    </Col>
                    <Col
                      xs={12}
                      sm={12}
                      md={4}
                      lg={4}
                      xl={3}
                    >
                        <Card
                            bg={'dark'}
                            text={'light'}
                            className="mb-2"
                            border="light"
                        >
                            <Card.Header>
                                Network Activity
                                <i className="bi bi-file-bar-graph-fill" style={{marginLeft:'0.5em'}}></i>
                                </Card.Header>
                            <Card.Body>
                                <Card.Text >        
                                    <b>Total Mints</b>  : {totalMintsForNetwork} <br></br>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <div style={{marginTop: '5em'}}></div>
                {blockAllActions() ?  <Row style={{marginTop:'0.5em'}} >
                    <b style={{color: '#77bb44'}}>Must be connected to Polygon Mainnet.</b>
                </Row> : '' }                
                <Row>
                    {darkBitsEntities.map((entity: Entity, index: number) =>
                                <Col
                                 xs={12}
                                 sm={12}
                                 md={4}
                                 lg={4}
                                 xl={3}
                                  key={index}
                                 >  
                                       <Card
                                            bg={'dark'}
                                            text={'light'}
                                            id="entity"
                                            className="mb-2 entity-card"
                                            border="secondary"
                                            onClick={ (e) => handleShow(entity)} 
                                            >
                                            <Card.Header style={{borderBottom:'none',backgroundColor: '#21252a'}}>
                                                {entity.name}
                                                {index === 0 || index === 10 ? 
                                              <i className="bi bi-stars" style={{ color: 'cornflowerblue', marginLeft:'0.5em'}}></i> : ''}
                                                
                                            </Card.Header>
                                            <Card.Body>
                                            <Card.Text style={{color:'#77bb44'}}>
                                            {`Balance : ${entity.balance.toFixed()}`}
                                            </Card.Text>
                                            </Card.Body>
                                        </Card>
                                 </Col>
                    )}   
                    <Col></Col>         
                </Row>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton style={{backgroundColor:'#c5c3c3', borderBottom:'none'}}>
                    <Modal.Title> <b>Send {targetEntity?.name}</b> </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{backgroundColor:'#c5c3c3'}}>
                        <Container>
                        <Row>
                                <Col>
                                  <b>Balance : {targetEntity?.balance}</b>
                                </Col>
                                <div style={{marginTop:'1em'}}></div>
                            </Row>
                            <Row>
                                <Col>
                                    <InputGroup className="mb-3">

                                        <InputGroup.Text id="basic-addon1">Recipient</InputGroup.Text>
                                        <FormControl
                                        placeholder="address"
                                        aria-label="address"
                                        aria-describedby="basic-addon1"
                                        onChange={(e) => handleSetRecipientAddress(e)}
                                        />  
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <InputGroup className="mb-3">

                                                <InputGroup.Text id="basic-addon1">Amount</InputGroup.Text>
                                        <FormControl
                                        type="number"
                                        min="0"
                                        
                                        placeholder="number"
                                        aria-label="amount"
                                        aria-describedby="basic-addon1"
                                        onChange={(e) => handleSetRecipientAmount(e)}

                                        />  
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Container>
                    </Modal.Body>
                    <Modal.Footer style={{backgroundColor:'#2c2b2b',borderTop:'none'}}>
                    <Button style={{marginRight:'0.5em',}} variant="primary" size="lg" onClick={handleClose}>Close</Button>
                    <Button style={{marginRight:'0.5em',borderColor: '#77bb44', color:'#77bb44'}} variant="outline-light" size="lg" onClick={handleSendDarkBits}>Send</Button>
                    </Modal.Footer>
                </Modal>
            </Container>     
    )
}