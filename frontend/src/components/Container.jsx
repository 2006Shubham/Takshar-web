import { useState } from "react"
import { Header } from "./Header"
import { SparkDashboard } from "./Spark/SparkDashboard";
import { FeedLayout } from "./FeedLayout";
import { PeersNetwork } from "./PeersNetwork";

export const Container = () => {

    const [tab, setTab] = useState('nav-home');

    const handleTabChange = (newTab) => {

        setTab(newTab);

    }

    return (
        <>
            <Header onTabChange={handleTabChange} />
            <div>

                {tab === 'nav-home' && <FeedLayout />
                }

            </div>

            {tab === 'nav-spark' && <SparkDashboard />}

            {tab === 'nav-peers' && <PeersNetwork />}



        </>
    )

}