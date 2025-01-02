import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";
import {useNavigate} from "react-router";

function Home() {
    const [selectedParticipant, setSelectedParticipant] = useState<number>();
    const navigate = useNavigate();

    function handleNavigate() {
        if (!selectedParticipant) return;
        else navigate(`./participant/${selectedParticipant}/test`);
    }

    return (
        <>
            <h1 className="text-3xl">Pin Scrambler User Study</h1>
            <Select onValueChange={(value) => setSelectedParticipant(parseInt(value))}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Participant"/>
                </SelectTrigger>
                <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 1).map((item) => (
                        <SelectItem key={item} value={item.toString()}>{`Participant ${item}`}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleNavigate}>Start User Study</Button>
        </>)
}

export default Home
