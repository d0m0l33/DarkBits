import React, { useEffect } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

interface Props {}

export const Details: React.FC<Props> = () => {
    useEffect(() => {
        const route = window.location.hash;
        const tokens = route.split('#');
        if(!tokens) {
            return;
        }
        const anchorId = `${tokens[2]}`;
        // Check if element with that id exists
        const el = document.getElementById(anchorId);
        if (el) {    
            el.scrollIntoView({behavior: "smooth"})
        }
    }, [window.location.hash])

    return (
            <Container style={{color: "white", marginTop: '3em'}}>
                <Row>
                    <Col>
                    </Col>
                    
                    <Col>
                    <div></div>
                    </Col>
                    <Col xs="12" sm="12" md="12" lg="auto" >
                    <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                            <h2>What are Dark Bits?</h2>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                            <p>
                            Dark Bits are tokens that represent on-chain entities that have emerged on Polygon. <br></br> 
                            These entities are implemented as <b style={{color:'#77bb44' }}>elements</b> and <b style={{color:'#77bb44' }}>organisms</b> which anyone can mint. <br></br> 
                            Each  <b style={{color:'#77bb44' }}>element</b> and  <b style={{color:'#77bb44' }}>organism</b> has an associated balance and inherent rarity. <br></br>
                            The rarity of these entities can be indentified by their <b>token ID</b> which ranges from 0 - 10. <br></br>
                            See the 'Entropy based rarity' section for more details. <br></br> 
                            The Dark Bits smart contract is <b>non upgradeable</b>, so the mint price will never change.
                            </p>
                        </div>
                    </Col>
                </Row>
                <div style={{marginBottom: '3em'}}></div>

                <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                            <h2>What can I do with it?</h2>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                            <p>
                            Anyone that mints Dark Bits may use it in derivative projects of their choosing. <br></br>
                            Example projects may include : <br></br> <br></br> 
                            - Smart contracts that combine different elements to create new items <br></br>
                            - Smart contracts that combine different organisms to create new organisms <br></br>
                            - On-chain games that make use of base or derivative items/organisms<br></br>
                            - Smart contracts that generate nfts which represent items augmented with Dark Bits elements<br></br> 
                              e.g. "Class 1 Element Hardened Chain Mail for increased protection" for <b>Loot</b> based projects<br></br>
                            - Additional naming and classification schemes for derivative elements and organisms voted on by communities <br></br>
                            </p>
                        </div>
                    </Col>
                </Row>
                <div style={{marginBottom: '3em'}}></div>


                <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                            <h2>Entropy based rarity</h2>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                        <p>
                           Dark Bits entities at the core are 10 bit strings. e.g. 1100111100. <br></br>
                           An entity's  <b>class</b>, which is also the same as it's  <b>token ID</b>, is equal to the number of <b>1's</b> in this string. <br></br>
                           Classes 0 - 6 are  <b style={{color:'#77bb44' }}>elements</b> and classes 7 - 10 are  <b style={{color:'#77bb44' }}>organisms</b>.  <br></br> Since minting is randomized,
                           rarity is left up to the probability of obtaining strings <br></br> with varying arrangements of 1's
                           and 0's. Strings with all 1's or all 0's are the least likely to emerge  <br></br> 
                           and so the most rare. 
                        </p>
                        </div>
                    </Col>
                </Row>
                <div style={{marginBottom: '3em'}}></div>

                <Row>
                <Col xs="12" sm="12" md="12" lg="8" >
                    <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>

                        <Table striped bordered hover variant="dark" >
                            <thead>
                                <tr>
                                <th>Class </th>
                                <th>Default Name </th>
                                <th>Amount Per Mint (balance) </th>
                                <th>Rarity </th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr>
                                <td style={{color:'#77bb44'}} >0</td>
                                <td style={{color:'#77bb44'}}>Element 0</td>
                                <td style={{color:'#77bb44'}}>1</td>
                                <td style={{color:'#77bb44'}}>Ultra Rare</td>
                                </tr>

                                <tr>
                                <td>1</td>
                                <td>Class 1 Element</td>
                                <td>1</td>
                                <td>Super Rare</td>
                                </tr>

                                <tr>
                                <td>2</td>
                                <td>Class 2 Element</td>
                                <td>2</td>
                                <td>Rare</td>
                                </tr>  
                                
                                <tr>
                                <td>3</td>
                                <td>Class 3 Element</td>
                                <td>10</td>
                                <td>Common</td>
                                </tr>

                                <tr>
                                <td>4</td>
                                <td>Class 4 Element</td>
                                <td>10</td>
                                <td>Common</td>
                                </tr>

                                <tr>
                                <td>5</td>
                                <td>Class 5 Element</td>
                                <td>100</td>
                                <td>Common</td>
                                </tr>

                                <tr>
                                <td>6</td>
                                <td>Class 6 Element</td>
                                <td>100</td>

                                <td>Common</td>
                                </tr>

                                <tr>
                                <td>7</td>
                                <td>Class 7 Organism</td>
                                <td>5</td>

                                <td>Fairly Rare</td>
                                </tr>

                                <tr>
                                <td>8</td>
                                <td>Class 8 Organism</td>
                                <td>2</td>

                                <td>Rare</td>
                                </tr>

                                <tr>
                                <td>9</td>
                                <td>Class 9 Organism</td>
                                <td>1</td>

                                <td>Super Rare</td>
                                </tr>

                                <tr>
                                <td style={{color:'#77bb44'}}>10</td>
                                <td style={{color:'#77bb44'}}>Organism 10</td>
                                <td style={{color:'#77bb44'}}>1</td>
                                <td style={{color:'#77bb44'}} >Ultra Rare</td>
                                </tr>
                                
                            </tbody>
                        </Table>  
                        </div>                
                    </Col>
        
                </Row>
                <Row>
                <Col xs="12" sm="12" md="12" lg="8" >
                    <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                        <p>
                           * Class, Default Name and Amount Per Mint are all on chain properties which can be read by anyone. <br></br>
                           * The rarity naming convention is subjective and there is no concept of this on-chain. Actual rarity is based on on-chain probability of minting specific entities and
                           the total number of each entity <b>actually</b> minted after the mint limit (100,000).<br></br>
                        </p>
                        </div>                  
                    </Col>
                </Row>
                <div style={{marginBottom: '3em'}}></div>
                <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                            <h2><a id="rewards">Rewards</a></h2>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col> 
                        <div style={{paddingLeft: '1em',paddingRight: '1em',textAlign: 'left'}}>
                        <p>
                        Fees are deposited into a Wrapped MATIC lending pool on AAVE
                        in exchange for <b><a style={{textDecoration: 'none'}} href="https://polygonscan.com/address/0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4"  target="_blank" rel="noopener noreferrer" >amWMATIC</a></b> interest bearing tokens. <br></br> 
                        For every <b>100 mints</b>, <b style={{color:'#77bb44'}}>50%</b> of the amWMATIC accrued will be <b>free to claim (+ gas fees)</b>,<br></br> 
                        by anyone who has minted at least <b>10 times.</b> <br></br>
                        Once someone has made a claim, the claim window is reset until another <b>100 transactions</b> have been made. <br></br>
                        This window will <b>remain opened indefinitely</b> until someone makes the claim, <br></br>
                        which will result in a larger reward as more mint transactions are made. <br></br> 
                        Any leftover rewards post mint cap (100,000) will also be able to be claimed. <br></br>
                        The remaining 50% of amWMATIC will be transfered to the <b style={{color:'#77bb44'}}>Dark Bits Treasury</b> (a multisig wallet)<br></br> 
                        to be later governed by the community.<br></br>
                        Funds <b>won't</b> be able to be transferred to this address until <b>20,000 mints</b> have been made.
                        </p>
                        </div>
                    </Col>
                </Row> 
                </Col>
                </Row>
                <Row>
                    <Col> 
                    <div style={{marginTop: '35em'}}></div>
                  
                    </Col>
                </Row>
      
        
      
            </Container>
    )
}