import MainLayout from "~/ui/templates/MainLayout/MainLayout";
import Features from "./components/Features";
import { BlockStack } from "~/ui/molecules";
import Content from "./components/Content";
import Footer from "./components/Footer";
import Hero from "./components/Hero";

const Login = () => {
    return (
        <MainLayout>
            <MainLayout.Content
                style={{
                    height: "100%",
                }}
            >
                <BlockStack
                    align="center"
                    inlineAlign="center"
                    gap={50}
                    style={{
                        maxWidth: "1360px",
                        margin: "0 auto",
                        padding: "20px",
                    }}
                >
                    <Hero />

                    <Content />

                    <Features />

                    <Footer />
                </BlockStack>
            </MainLayout.Content>
        </MainLayout>
    );
};

export default Login;
