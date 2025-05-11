import { GoogleGenAI } from "@google/genai"; 
import { useState, useEffect, useRef } from "react"; 
import ReactMarkdown from "react-markdown"; 
import styles from "../styles/fact-check.module.scss"; 
 
const ai = new GoogleGenAI({ 
    apiKey: `${import.meta.env.VITE_GEMINI_API_KEY}`, 
}); 
 
async function geminiResponse(claimOrNews: string): Promise<[string, string, string[], string[]]>{ 
    console.log("Here in the geminiResponseMethod"); 
    const response = await ai.models.generateContent({ 
        model: "gemini-2.5-flash-preview-04-17", 
        contents: [ 
            `Give the assessment of the truthfuless of the follwoing claim(highlight the assessment):\n${claimOrNews}` 
        ], 
        config: { 
            tools: [{googleSearch: {}}], 
        }, 
    }); 
    if (!response){ 
        console.log("NO RESPONSE"); 
    } 
    console.log("Response recieved, ",response); 
     
    let res = response.candidates?.[0].content?.parts?.[0].text; 
    if (!res){ 
        console.log(res); 
    } 
    res = res!; 
 
    const html = response.candidates?.[0].groundingMetadata?.searchEntryPoint?.renderedContent || ""; 
    // html = "\"" + html + "\""; 
    // html = JSON.parse(html); 
 
    const referencesFromResponse = response.candidates?.[0].groundingMetadata?.groundingChunks; 
    const tempReferences: string[] = []; 
    const tempReferencesTitles: string[] = []; 
 
    if (referencesFromResponse){ 
        for (const referenceData of referencesFromResponse){ 
            const uri = referenceData.web?.uri; 
            const title = referenceData.web?.title; 
            if (!uri || !title) { 
                continue; 
            } 
            tempReferences.push(uri); 
            tempReferencesTitles.push(title); 
        } 
    } 
 
    return [res, html, tempReferences, tempReferencesTitles]; 
} 
 
export default function FactCheck(){ 
    const [input, setInput] = useState<string>(""); 
    const [claimOrNews, setClaimOrNews] = useState<string>(""); 
    const [result, setResult] = useState<string>(""); 
    const [googleHtml, setGoogleHtml] = useState<string>(""); 
    const [resReferences, setResReferences] = useState<string[]>([]); 
    const [resReferencesTitles, setResReferencesTitles] = useState<string[]>([]); 
    const isFirstRender = useRef<boolean>(true);
    const isFirstResult = useRef<boolean>(true);
 
    console.log(claimOrNews); 
    // console.log(result); 
 
    useEffect(() => { 
         
        if (!claimOrNews || isFirstRender.current){
            isFirstRender.current = false;
            return;
        } 
 
 
        geminiResponse(claimOrNews).then(([res, html, tempReferences, tempReferencesTitles]) => { 
            setResult(res); 
            setGoogleHtml(html); 
            setResReferences(tempReferences); 
            setResReferencesTitles(tempReferencesTitles);
            isFirstResult.current = false; 
        }).catch((error) => { 
            console.error("Got an error",error.message); 
        }); 
    }, [claimOrNews]); 
 
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { 
        if (e.key === "Enter" && !e.shiftKey){ 
            e.preventDefault(); 
            setClaimOrNews(input); 
            setInput(""); 
            setResult(""); 
        } 
    }; 
 
    const handleOnClick = () => { 
        setClaimOrNews(input); 
        setInput(""); 
        setResult(""); 
    }; 
 
    return ( 
        <div className = {styles["fact-check-body"]}> 
            { 
            result.length === 0 && claimOrNews.length === 0? 
            (<div> 
                <h1>Fact Check</h1> 
                <h3>Reveal The Truth Behind Everything*</h3> 
            </div>) 
            : 
            (<div className = {styles["empty-heading"]}></div>) 
        } 
            <textarea  
                value = {input} 
                onChange = {(e) => setInput(e.target.value)} 
                onKeyDown = {handleKeyDown} 
                placeholder = "Enter a claim or a news" 
                className = {styles["input"]} 
            /> 
            { 
                result.length > 0? ( 
                    <div className = {styles["result-container"]}> 
                        <div className = {styles["result"]}> 
                            <ReactMarkdown>{result}</ReactMarkdown> 
                        </div> 
                        <div dangerouslySetInnerHTML={{__html: googleHtml}}></div> 
                        <details className = {styles["references"]}> 
                            <summary className = {styles["references-summary"]}>References</summary> 
                            <ul> 
                                { 
                                    resReferences.map((ref, i) => ( 
                                        <li key = {i}> 
                                            <a href = {ref} className = {styles["reference-link"]}> 
                                                {resReferencesTitles[i]} 
                                            </a> 
                                        </li> 
                                    )) 
                                } 
                            </ul> 
                        </details> 
                    </div> 
                ) : 
                ( 
                    claimOrNews.length > 0?( 
                        <div className = {styles["loading-result"]}>Fact Checking...</div> 
                    )  
                    : 
                    (<div className = {styles["empty-result"]}></div>) 
                ) 
            } 
 
            <button className = {styles["submit-btn"]} onClick = {handleOnClick}>Sumbit</button> 
 
        </div> 
    ); 
} 