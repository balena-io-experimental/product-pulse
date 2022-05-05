import React from 'react';
import { Box, Button, Card, Divider, Flex, Heading, Txt } from 'rendition';

import { AiFillGithub, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { Accordion, AccordionPanel } from 'grommet';

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
  <>
    <RoundButton color={mapColor(color)}></RoundButton>
    <Box style={{ width: 5 }}></Box>
    <Txt>{text}</Txt>
  </>
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

const CardFooter = ({ repoHandler }) => (
  <Box
    onClick={() => window.open(`https://github.com/${repoHandler}`)}
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
      <Txt>{repoHandler}</Txt>
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

const Checks = ({ criterias }) => (
  <Flex flexDirection='column'>
    {Object.keys(criterias).map((key) => (
      <Flex key={key}>
        {criterias[key] ? (
          <AiOutlineCheck color='green' />
        ) : (
          <AiOutlineClose color='red' />
        )}
        <Txt>{key}</Txt>
      </Flex>
    ))}
  </Flex>
);

const renderPanel = (direction, maintenance, community) => (
  <Flex>
    <StatusBadge text='Direction' color={direction}></StatusBadge>
    <Box style={{ width: 90 }} />
    <StatusBadge text='Maintenance' color={maintenance}></StatusBadge>
    <Box style={{ width: 90 }} />
    <StatusBadge text='Community' color={community}></StatusBadge>
  </Flex>
);

const ProductCard = ({ owner, repo, model, onClose }) => {
  const { direction, maintenance, community } = model;

  return (
    <Flex flexDirection='column'>
      <CardTopDetail
        color={generalStatusColor([direction, maintenance, community])}
      />

      <Box width={500} fontSize={2} style={cardStyle}>
        <CardHeader title={repo} onClose={onClose} />
        <Accordion>
          <AccordionPanel
            header={renderPanel(direction, maintenance, community)}
          >
            <Flex flexDirection='row' style={{ margin: 15 }}>
              <Checks
                criterias={{
                  contributors: false,
                  reviewers: false,
                  issues: true,
                  commits: false,
                }}
              />
              <Box style={{ width: 90 }} />
              <Checks criterias={{ prs: true, tests: false, build: true }} />
              <Box style={{ width: 140 }} />
              <Checks criterias={{ forks: true, active: false, stars: true }} />
            </Flex>
          </AccordionPanel>
        </Accordion>
      </Box>
      <CardFooter repoHandler={`${owner}/${repo}`} />
    </Flex>
  );
};

export default ProductCard;
