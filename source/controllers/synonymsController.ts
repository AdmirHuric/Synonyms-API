import { NextFunction, Request, Response } from 'express';
import SynonymsGraph from '../models/synonymsGraph';
import ISynonym from '../interfaces/synonymInterface';
import IResponseData from '../interfaces/responseDataInterface';
import IResponseError from '../interfaces/responseErrorInterface';
import config from '../config/config';
import logging from '../config/logging';

const NAMESPACE = 'Synonym Controller';

const synonymsGraph = new SynonymsGraph(),
    searchSynonyms = (word: string): string[] => {
        return synonymsGraph.searchSynonyms(word);
    };

const addSynonym = (req: Request, res: Response, next: NextFunction) => {
    const { word, synonym } = req.body,
        { wordAndSynonymCantBeSame, synonymAlreadyAdded, synonymSuccessfullyAdded } = config.server.messages,
        { conflict, success } = config.server.statusCodes,
        loggedObject: ISynonym = { word, synonym };
    let data: IResponseData = {
        synonyms: searchSynonyms(word.toLowerCase()),
        message: ''
    };

    if (word === synonym) {
        data.message = wordAndSynonymCantBeSame;
        logging.warn(NAMESPACE, data.message, loggedObject);
        return res.status(conflict).json({ data });
    }

    if (synonymsGraph.hasSynonym(word, synonym)) {
        data.message = synonymAlreadyAdded;
        logging.warn(NAMESPACE, data.message, loggedObject);
        return res.status(conflict).json({ data });
    }

    synonymsGraph.addSynonym(word.toLowerCase(), synonym.toLowerCase());
    data = {
        synonyms: searchSynonyms(word.toLowerCase()),
        message: synonymSuccessfullyAdded
    };

    logging.info(NAMESPACE, data.message, loggedObject);
    return res.status(success).json({ data });
};

const getSynonyms = (req: Request, res: Response, next: NextFunction) => {
    const { word } = req.params,
        { synonymsSuccessfullyReturned, synonymsListEmpty } = config.server.messages,
        loggedObject: ISynonym = { word },
        synonyms = searchSynonyms(word.toLowerCase()),
        data: IResponseData = {
            synonyms,
            message: synonyms.length > 0 ? synonymsSuccessfullyReturned : synonymsListEmpty
        };

    logging.info(NAMESPACE, data.message, loggedObject);
    return res.status(config.server.statusCodes.success).json({ data });
};

const deleteSynonym = (req: Request, res: Response, next: NextFunction) => {
    const { word, synonym } = req.params,
        { synonymDoesntExist, synonymSuccessfullyDeleted } = config.server.messages,
        { success, notFound } = config.server.statusCodes,
        loggedObject: ISynonym = { word, synonym };
    let data: IResponseData | IResponseError;

    if (!synonymsGraph.hasSynonym(word, synonym)) {
        const error = new Error(synonymDoesntExist.replace('${synonym}', synonym));
        data = {
            error,
            message: error.message
        };

        logging.warn(NAMESPACE, data.message, loggedObject);
        return res.status(notFound).json({ data });
    }

    synonymsGraph.deleteSynonym(word.toLowerCase(), synonym.toLowerCase());
    data = {
        synonyms: searchSynonyms(word.toLowerCase()),
        message: synonymSuccessfullyDeleted
    };

    logging.info(NAMESPACE, data.message, loggedObject);
    return res.status(success).json({ data });
};

export default { addSynonym, getSynonyms, deleteSynonym };
