import React from 'react';
import { Box, Button, Divider, Flex, Heading, Txt } from 'rendition';
import { Accordion, AccordionPanel } from 'grommet';
import { AiFillGithub, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { ThemeProvider } from 'styled-components';

import { toTitleCase } from '../utils';

/**
 * Map string color into hex
 * @param {string} color
 * @returns color as hex
 */
const mapColor = (color) => {
  if (color === 'red') {
    return '#ff4d4d';
  } else if (color === 'green') {
    return '#4bd28f';
  } else if (color === 'yellow') {
    return '#ffaa00';
  }
};

/**
 * Gets the average color for a card
 * @param {Array} colors
 * @returns average color as hex
 */
const generalStatusColor = (colors) => {
  const score = colors.reduce((prev, cur) => {
    if (cur === 'green') {
      return prev + 1;
    } else if (cur === 'red') {
      return prev - 1;
    }

    return prev;
  }, 0);

  if (score > 1) {
    return '#4bd28f';
  } else if (score < -1) {
    return '#ff4d4d';
  } else {
    return '#ffaa00';
  }
};

const theme = {
  accordion: {
    heading: {
      level: 3,
      margin: { vertical: '6px', horizontal: '24px' },
    },
    hover: {
      heading: {
        color: 'accent-2',
      },
    },
    icons: {
      collapse: undefined,
      expand: undefined,
      color: 'transparent',
    },
    border: undefined,
    panel: {
      border: undefined,
    },
  }
};

const cardStyle = {
  border: '1px solid rgba(0, 0, 0, 0.07)',
  padding: '20px',
};

const RoundButton = ({ color }) => (
  <div
    style={{
      backgroundColor: color,
      width: 20,
      height: 20,
      borderRadius: '100%',
      justifyContent: 'center',
    }}
  />
);

const StatusBadge = ({ text, color }) => (
  <Box width={'30%'}>
    <Flex flexDirection={'row'}>
      <RoundButton color={mapColor(color)} />
      <Txt ml={'5px'}>{toTitleCase(text)}</Txt>
    </Flex>
  </Box>
);

const CloseButton = ({ onClose }) => (
  <Button onClick={onClose} plain style={{ fontSize: 18 }}>
    x
  </Button>
);

const CardHeader = ({ title, onClose }) => (
  <>
    <Flex justifyContent='space-between' alignItems='center'>
      <Heading.h5 fontSize={4}>{title}</Heading.h5>
      <CloseButton onClose={onClose} />
    </Flex>
    <Divider my={2} />
  </>
);

const CardFooter = ({ repoHandle }) => (
  <Box
    onClick={() => window.open(`https://github.com/${repoHandle}`)}
    style={{
      border: '1px solid rgba(0, 0, 0, 0.07)',
      backgroundColor: 'rgba(239,239,239,255)',
      cursor: 'pointer',
      width: 500,
      borderBottomRightRadius: 5,
      borderBottomLeftRadius: 5,
      marginBottom: 10,
    }}
  >
    <Flex>
      <AiFillGithub size={20} style={{ paddingLeft: 10, paddingRight: 5 }} />
      <Txt>{repoHandle}</Txt>
    </Flex>
  </Box>
);

const CardTopDetail = ({ color }) => (
  <Box
    style={{
      height: 10,
      backgroundColor: color,
      width: 500,
      borderTopRightRadius: 5,
      borderTopLeftRadius: 5,
    }}
  />
);

const Checks = ({ data }) => (
  <Flex flexDirection='column' width={'30%'} pl={'0.5em'}>
    {
      data.map((item, idx) => (
        <Flex key={idx} my={'0.1em'}>
          {
            item.pass ?
              <AiOutlineCheck color={'green'} /> :
              <AiOutlineClose color={'red'} />
          }
          <Txt pl={'0.1em'}>{item.criterion}</Txt>
        </Flex>
      ))
    }
  </Flex>
);

const renderPanel = (colorsByCategory) => (
  <Flex width={'100%'} justifyContent={'space-around'} mt={'0.5em'}>
    {
      Object.keys(colorsByCategory).map((category, idx) => (
        <StatusBadge
          key={idx}
          text={category} 
          color={colorsByCategory[category].color}
        />
      ))
    }
  </Flex>
);

const ProductCard = ({ owner, repo, model, onClose, setActiveCard }) => {
  const colorsByCategory = Object.keys(model).reduce((map, category) => {
    map[category] = { 
      color: model[category].color, 
      score: model[category].score
    };
    return map;
  }, {});
  const ownerRepo= `${owner}/${repo}`;

  return (
    <Flex flexDirection='column'>
      <CardTopDetail
        color={generalStatusColor(Object.values(colorsByCategory))}
      />
      <Box width={500} fontSize={2} style={cardStyle}>
        <CardHeader 
          title={repo} 
          onClose={onClose}
        />
        <Accordion>
          <ThemeProvider theme={theme}>
            <AccordionPanel
              header={renderPanel(colorsByCategory)}
              onClick={() => setActiveCard(ownerRepo)}
            >
              <Flex 
                width={'100%'} 
                justifyContent={'space-around'}
                mt={'0.75em'}
              >
                {
                  Object.values(model).map(({ details }, idx) => (
                    <Checks 
                      key={idx} 
                      data={details}
                    />
                  ))
                }
              </Flex>
            </AccordionPanel>
          </ThemeProvider>
        </Accordion>
      </Box>
      <CardFooter repoHandle={ownerRepo} />
    </Flex>
  );
}


export default ProductCard;
