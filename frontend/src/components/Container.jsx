import { useState } from "react"
import { Header } from "./Header"
import { Feed } from "./Feed";
import { SparkDashboard } from "./Spark/SparkDashboard";

export const Container = () => {

    const [tab, setTab] = useState('nav-home');

    const handleTabChange = (newTab) => {

        setTab(newTab);

    }

    return (
        <>
            <Header onTabChange={handleTabChange} />

            {tab === 'nav-home' && <Feed />}
            {tab === 'nav-spark' && <SparkDashboard />}

        </>
    )

}