import { GetBlockResult as oldGetBlockResult } from 'eosjs/dist/eosjs-rpc-interfaces';


export interface JsonFormatLog{
    type: string;
    timestamp: number;
    ip: Array<string> | string;
    port?: Array<number> | number;
    protocol?: string;
    payload: string | object; //Array<string>;
}

export interface GetBlockResult extends oldGetBlockResult{
    transactions: Array<Transaction>
}

export interface LinkParameter {
    contract: string;
    chain: string;
    scope: string;
    indexTable: string;
    id: number;
    keydir: string;
    tableViewMode: boolean;
}

export interface PermissionEntry{
    user: string;
    storeData: boolean;
    readData: boolean;
    rPubKey: string; 
    rPubKeyup: string;
}

export interface DataLog{
    scope?: string;             // Name of the scope
    user: string;               // Name of the uploader account
    data: string;               // Log data to store
    refBlock: number;           // Referred block number
    refTrxNr?: number;          // Index number of the transaction in the referred block 
    refTrx: string;             // Referred transaction hash 
    thisRefBlock?: number;      // Current block number of this log
    thisRefTrx?: string;        // Index number of the transaction in the current block of this log
    thisRefTrxNr?: number;      // Current transaction hash of this log
}

export interface Action{
    account: string;
    name: string;
    authorization: Array<any>;
    data: object;
    hex_data: string;
}

export interface PerformedTransaction{
    expiration: string;
    ref_block_num: number;
    ref_block_prefix: number;
    max_net_usage_words: number;
    max_cpu_usage_ms: number;
    delay_sec: number;
    context_free_actions: Array<any>;
    actions: Array<Action>;
}

export interface Trx{
    id: string;
    signature: Array<any>;
    compression: string;
    packed_context_free_data: string;
    packed_trx: string;
    transaction: PerformedTransaction;
}
export interface Transaction{
    status: string,
    cpu_usage_us: number,
    net_usage_words: number,
    trx: Trx
}

export interface BlockChainNetwork{
    endpoint: string, 
    contract?: string, 
    scope?:string
    user?: string,
    privateKey?: string,
}

export interface SDC_wsa {
    Action?: string,
    MessageID?: string,
    To?: string,
    From?: string,
    ReplyTo?: string,
    RelatesTo?: string,
    FaultTo?: string,

    Address?: string,
}

export interface SDC_wse {
    Identifier?: string,
    Expires?: string,
}

export interface SDC_wsd {
    Types?: string,
}
