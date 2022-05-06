import React, { useState } from 'react';
import { Card, Box, Heading, Txt, Flex } from 'rendition';
import { AiOutlineQuestionCircle, AiOutlineCloseCircle } from 'react-icons/ai';

import { toTitleCase } from '../utils';

const InfoCard = ({ cardData, active }) => {
    // if (active === '') {
    //     return null;
    // }
    // TODO: Display the exact scores for each criteria from activeCard
    // You'll need to edit the ternary below and uncomment the if statement above
    const repos = Object.keys(cardData);
    if (!repos.length) {
        return null;
    }
    const activeCard = active ? cardData[active] : cardData[repos[0]];

    const [showInfo, setShowInfo] = useState(false);


    return (
        <Box style={{ position: 'absolute', right: 20, top: 20 }}>  
        {
            showInfo ? (
            <Card textAlign={'left'} width={'100%'} style={{ position: 'relative' }}>
                <Box onClick={() => setShowInfo(false)}>
                    <AiOutlineCloseCircle 
                        cursor={'pointer'} 
                        size={'1.5em'}
                        style={{ position: 'absolute', top: 15, right: 15 }}
                    />
                </Box>
                <>
                    {
                        Object.keys(activeCard).map((header, idx) => (
                            <Box key={idx} pb={'0.5em'}>
                                <Flex flexDirection={'row'} justifyContent={'space-between'}>
                                    <Heading.h5 fontSize={'1em'} pb={'0.3em'}>{toTitleCase(header)}</Heading.h5>
                                </Flex>
                                
                                <Box pl={'1em'}>
                                    <>
                                        {
                                            activeCard[header].details.map((c, jdx) => (
                                                <Box key={jdx}>
                                                    <Flex flexDirection={'row'} justifyContent={'space-between'}>
                                                        <Heading.h5 fontSize={'1em'}>{toTitleCase(c.criterion)}</Heading.h5>
                                                    </Flex>
                                                    <Txt pl={'1em'} fontSize={'0.9em'}>{c.description}</Txt>
                                                </Box>
                                            ))
                                        }
                                    </>
                                </Box>
                            </Box>
                        ))
                    }
                </>
            </Card>
            ) : (
                <Box onClick={() => setShowInfo(true)}>
                    <AiOutlineQuestionCircle cursor={'pointer'} size={'1.5em'}/>
                </Box>
            )
        }
        </Box>
    );
}

export default InfoCard;
