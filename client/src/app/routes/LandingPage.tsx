import { Helmet } from "react-helmet-async";

const LandingPage = () => {
    return (
        <>
            <Helmet>
                <title>Home | DODZ Fried Chicken</title>
                <meta
                    name="description"
                    content="DODZ Fried Chicken is a restaurant that serves fried chicken with premium quality for everyone."
                />
            </Helmet>
            <div className="min-h-screen bg-primary">
                <p className="text-secondary">HELLO WORLD</p>
            </div>
        </>
    )
}

export default LandingPage
