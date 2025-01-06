import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type TLXData = {
    mentalDemand: number;
    physicalDemand: number;
    temporalDemand: number;
    performance: number;
    effort: number;
    frustration: number;
    condition: string;
    participantId: string;
};

interface NASATLXProps {
    condition: string;
    participantId: string;
    onComplete: (data: TLXData) => void;
}

export default function NASATLX({ condition, participantId, onComplete }: NASATLXProps) {
    const [ratings, setRatings] = useState<TLXData>({
        mentalDemand: 50,
        physicalDemand: 50,
        temporalDemand: 50,
        performance: 50,
        effort: 50,
        frustration: 50,
        condition,
        participantId
    });

    const dimensions = [
        {
            key: 'mentalDemand',
            title: 'Mental Demand',
            description: 'How mentally demanding was the task?',
            low: 'Very Low',
            high: 'Very High'
        },
        {
            key: 'physicalDemand',
            title: 'Physical Demand',
            description: 'How physically demanding was the task?',
            low: 'Very Low',
            high: 'Very High'
        },
        {
            key: 'temporalDemand',
            title: 'Temporal Demand',
            description: 'How hurried or rushed was the pace of the task?',
            low: 'Very Low',
            high: 'Very High'
        },
        {
            key: 'performance',
            title: 'Performance',
            description: 'How successful were you in accomplishing what you were asked to do?',
            low: 'Perfect',
            high: 'Failure'
        },
        {
            key: 'effort',
            title: 'Effort',
            description: 'How hard did you have to work to accomplish your level of performance?',
            low: 'Very Low',
            high: 'Very High'
        },
        {
            key: 'frustration',
            title: 'Frustration',
            description: 'How insecure, discouraged, irritated, stressed, and annoyed were you?',
            low: 'Very Low',
            high: 'Very High'
        }
    ];

    const handleSubmit = () => {
        onComplete(ratings);
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>NASA Task Load Index</CardTitle>
                    <CardDescription>
                        Please rate your experience with the task you just completed in condition: {condition}
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="space-y-8">
                {dimensions.map(({ key, title, description, low, high }) => (
                    <Card key={key} className="p-4">
                        <CardHeader>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Slider
                                    value={[ratings[key as keyof TLXData] as number]}
                                    onValueChange={(value) =>
                                        setRatings(prev => ({
                                            ...prev,
                                            [key]: value[0]
                                        }))
                                    }
                                    min={0}
                                    max={100}
                                    step={5}
                                />
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>{low}</span>
                                    <span>{ratings[key as keyof TLXData]}</span>
                                    <span>{high}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-center">
                <Button
                    onClick={handleSubmit}
                    className="w-full max-w-md"
                >
                    Submit Ratings
                </Button>
            </div>
        </div>
    );
}
