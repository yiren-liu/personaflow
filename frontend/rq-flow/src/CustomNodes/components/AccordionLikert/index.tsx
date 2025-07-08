import { useContext } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Likert from "react-likert-scale";
import { NodeData } from '../../../types/api';
import { useApi } from '../../../controllers/API';
import { contextMenuContext } from '../../../contexts/contextMenuContext';
import { NodeDataType } from '../../../types/flow';

type LikertConfigs = {
    items: {
        question: string;
        tag: string;
    }[],
    responses: {
        value: number;
        text: string;
    }[];
};

type AccordionLikertProps = {
    likertConfigs: LikertConfigs;
    validationStatus: string;
    nodeData: NodeDataType;
};

const AccordionLikert = ({ likertConfigs, validationStatus, nodeData }
    : AccordionLikertProps
) => {
    const {
        setRatedNodesById
    } = useContext(contextMenuContext);
    const { saveLog } = useApi();

    const likertQuestions = likertConfigs.items.map(item => item.question);
    const likertTags = likertConfigs.items.map(item => item.tag);
    const likertResponses = likertConfigs.responses;

    const likertOptions = {
        // question: "What is your opinion of the generated question?",
        responses: likertResponses,
        onChange: (val: number) => {
            // console.log(val);

            // save log
            saveLog("rating", {
                "node_data": nodeData,
                "rating": val,
            })

            // set rated nodes
            setRatedNodesById(nodeData.id);
        },
    };

    return (
        <div className="space-y-2">
            {validationStatus === "success" &&
                <Accordion
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <p className="text-sm font-medium">Click to rate this node:</p>
                    </AccordionSummary>
                    <AccordionDetails>
                        {
                            likertQuestions.map((question, index) => {
                                const newLikertOptions = {
                                    onChange: likertOptions.onChange,
                                }
                                let res = [] as any;
                                for (const [key, value] of Object.entries(likertOptions.responses)) {
                                    res.push({ ...value, type: likertTags[index] });
                                }
                                newLikertOptions['responses'] = res;

                                return <Likert
                                    {...newLikertOptions}
                                    className="text-xs"
                                    {...{ question: question }}
                                />
                            })
                        }
                    </AccordionDetails>
                </Accordion>
            }
        </div>
    )
};

export default AccordionLikert;