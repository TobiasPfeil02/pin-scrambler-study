import {useNavigate, useParams} from "react-router";
import {latinSquareOrder, loadVideos, shuffleArray} from "@/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import testVideo from "@/assets/Example_8158.mp4";

export default function Participant() {
    const {id, condition, videoIndex} = useParams();
    const navigate = useNavigate();
    const participant = parseInt(id!);
    const conditionOrder = latinSquareOrder(participant)


    const [guess, setGuess] = useState<string>("");
    const [guessIndex, setGuessIndex] = useState<number>(1);
    const [videos, setVideos] = useState<{ video: never, pinCode: string }[]>();

    function handleNavigate() {
        setGuessIndex(1);
        if (!condition) return;
        else if (condition === "test") {

            navigate(`/participant/${id}/${conditionOrder[0]}/1`);
        } else {
            const nextCondition = conditionOrder[conditionOrder.indexOf(condition!) + 1];
            if (nextCondition) navigate(`/participant/${id}/${nextCondition}/1`);
            else navigate(`/`);
        }
    }

    function checkGuess() {
        if (condition === "test") {
            if (guess === "8158") {
                console.log("Correct Guess")
            }
        } else {
            if (guess === videos![parseInt(videoIndex!)-1].pinCode || guessIndex === 3 && parseInt(videoIndex!) < 5) {
                setGuess("");
                setGuessIndex(1);
                navigate(`/participant/${id}/${condition}/${parseInt(videoIndex!) + 1}`);
                return;
            }
        }
        setGuess("");
        setGuessIndex(prevState => prevState + 1);
    }

    useEffect(() => {
        async function fetchVideos() {
            if (!condition) return;
            const videoObjects = await loadVideos(condition);
            const shuffledVideos: { video: never, pinCode: string }[] = shuffleArray(videoObjects, participant);
            setVideos(shuffledVideos);
            console.log("Videos", shuffledVideos);
        }

        fetchVideos();
    }, [participant, condition])

    return (<div className="flex flex-col items-center justify-center w-full h-full gap-2">
            <h1>Participant {id}</h1>
            <h2>Condition: {condition}</h2>
            <div className="bg-gray-500 w-1/2 aspect-video">
                {condition === "test" && <video src={testVideo} className="w-full h-full" autoPlay muted/>}
                {condition !== "test" && videos && videoIndex &&
                    <video src={videos[parseInt(videoIndex)-1]?.video} className="w-full h-full" autoPlay muted/>}
            </div>
            <div className="flex gap-2">
                <Input type="text"
                       maxLength={4}
                       value={guess}
                       onChange={(event) => setGuess(event.target.value)}/>
                <Button onClick={checkGuess} disabled={guessIndex > 3}>Submit</Button>
            </div>
            {condition === "test" && <Button onClick={handleNavigate}>Start Study</Button>}
            {condition !== "test" && videos && videoIndex &&
                <Button onClick={handleNavigate} disabled={parseInt(videoIndex!) < videos!.length}>Continue</Button>}
        </div>
    )
}
