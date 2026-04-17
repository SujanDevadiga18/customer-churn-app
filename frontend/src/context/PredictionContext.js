import React, { createContext, useContext, useState } from 'react';

const PredictionContext = createContext();

export function PredictionProvider({ children }) {
    const [singleResult, setSingleResult] = useState(null);
    const [singleForm, setSingleForm] = useState({
        telecom_partner: "Reliance Jio",
        data_used: "",
        tenure_months: "",
        inactive_days: "",
        sms_sent: "",
        calls_made: ""
    });

    const [batchResult, setBatchResult] = useState(null);

    const clearSingleRes = () => {
        setSingleResult(null);
        setSingleForm({
            telecom_partner: "Reliance Jio",
            data_used: "",
            tenure_months: "",
            inactive_days: "",
            sms_sent: "",
            calls_made: ""
        });
    };

    const clearBatchRes = () => {
        setBatchResult(null);
    };

    return (
        <PredictionContext.Provider value={{ 
            singleResult, setSingleResult, 
            singleForm, setSingleForm,
            batchResult, setBatchResult,
            clearSingleRes, clearBatchRes
        }}>
            {children}
        </PredictionContext.Provider>
    );
}

export const usePrediction = () => useContext(PredictionContext);
