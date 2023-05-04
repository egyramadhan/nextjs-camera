import {
      Box,
      Button,
      ButtonGroup,
      Center,
      Flex,
      FormControl,
      Image,
      Stack,
      Text,
      useToast,
      AspectRatio,
      Textarea,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function ResultPhoto() {
      const router = useRouter();
      const [myFoto, setMyFoto] = useState("");
      const [fileImage, setFileImage] = useState(null);
      const toast = useToast();

      const [prediction, setPrediction] = useState(null);
      const [prompt, setPrompt] = useState("");

      const handleInputChange = (e) => setPrompt(e.target.value);
      const [error, setError] = useState(null);

      useEffect(() => {
            setMyFoto(localStorage.getItem("myPhoto"));
            urltoFile(
                  localStorage.getItem("myPhoto"),
                  "myPhotos.jpeg",
                  "image/jpeg"
            ).then(function (file) {
                  setFileImage(file);
            });
      }, [myFoto]);

      //convert from base64 format to image file
      function urltoFile(url, filename, mimeType) {
            return fetch(url)
                  .then(function (res) {
                        return res.arrayBuffer();
                  })
                  .then(function (buf) {
                        return new File([buf], filename, { type: mimeType });
                  });
      }

      function reSelfie() {
            router.push({
                  pathname: "/",
            });
      }

      //css
      const imageResult = {
            "border-radius": "50%",
            "object-fit": "cover",
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            const response = await fetch("/api/predictions", {
                  method: "POST",
                  headers: {
                        "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                        a_prompt: "best quality, extremely detailed",
                        ddim_steps: 20,
                        detect_resolution: 512,
                        image_resolution: "512",
                        n_prompt: "ongbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
                        num_samples: "1",
                        scale: 9,
                        image: myFoto,
                        prompt: prompt,
                        // guidance_scale: e.target.guidance_scale.value,
                        // num_inference_steps: e.target.num_inference_steps.value,
                  }),
            });
            let prediction = await response.json();
            if (response.status !== 201) {
                  setError(prediction.detail);
                  return;
            }
            setPrediction(prediction);
            while (
                  prediction.status !== "succeeded" &&
                  prediction.status !== "failed"
            ) {
                  await sleep(1000);
                  const response = await fetch(
                        "/api/predictions/" + prediction.id
                  );
                  prediction = await response.json();
                  if (response.status !== 200) {
                        setError(prediction.detail);
                        return;
                  }
                  console.log({ prediction });
                  setPrediction(prediction);
            }
      };
      return (
            <Box
                  bgGradient="linear(to-l, #7928CA, #FF0080)"
                  bgPosition="center"
                  bgSize="cover"
                  h="100vh"
            >
                  <Center>
                        <Box
                              maxW="sm"
                              mt={{ base: "0px", md: "10px", lg: "10px" }}
                              height={{ base: "100%", md: "50%", lg: "25%" }}
                              width={{ base: "600px", md: "50%", lg: "25%" }}
                              borderWidth={{
                                    base: "0px",
                                    md: "1px",
                                    lg: "1px",
                              }}
                              bg="teal.400"
                              justifyContent="center"
                              overflow="hidden"
                              borderRadius="lg"
                              rounded={24}
                        >
                              <Flex direction="column" background="white" p={2}>
                                    <Box>
                                          {/* <Box h="80px">
                <Center>
                  <img src="" width="80px" height="80px" alt="Logo" />
                </Center>
              </Box> */}
                                          <Box mt={2}>
                                                <AspectRatio
                                                      maxW="400px"
                                                      ratio={9 / 16}
                                                >
                                                      <Image
                                                            objectPosition="-20% 20%"
                                                            rounded="md"
                                                            src={myFoto.replace(
                                                                  "data:image/jpeg;base64,:",
                                                                  ""
                                                            )}
                                                            objectFit={"cover"}
                                                      />
                                                </AspectRatio>
                                          </Box>
                                          <FormControl mt={6}>
                                                <Stack>
                                                      <Text
                                                            align={"center"}
                                                            fontSize="2xl"
                                                            color={"#black"}
                                                            as="b"
                                                      >
                                                            Check your selfies
                                                            photos.
                                                      </Text>
                                                </Stack>
                                          </FormControl>

                                          <FormControl mt={3}>
                                                <Center>
                                                      <Button
                                                            colorScheme="blue"
                                                            width="60%"
                                                            variant="outline"
                                                            rounded={10}
                                                            onClick={reSelfie}
                                                      >
                                                            Take Re-Selfie
                                                      </Button>
                                                </Center>
                                          </FormControl>
                                          <FormControl mt={3}>
                                                <Stack>
                                                      <Textarea
                                                            name="prompt"
                                                            value={prompt}
                                                            onChange={
                                                                  handleInputChange
                                                            }
                                                            placeholder="Enter a prompt to display an image"
                                                      />
                                                      <Center>
                                                            <Button
                                                                  bg="#FD541E"
                                                                  width="60%"
                                                                  rounded={10}
                                                                  colorScheme="orange"
                                                                  onClick={
                                                                        handleSubmit
                                                                  }
                                                            >
                                                                  Go
                                                            </Button>
                                                      </Center>
                                                </Stack>
                                          </FormControl>
                                          {error && <div>{error}</div>}

                                          {prediction && (
                                                <>
                                                      {prediction.output && (
                                                            <div className="image-wrapper mt-5">
                                                                  <Image
                                                                        fill
                                                                        src={
                                                                              prediction
                                                                                    .output[
                                                                                    prediction
                                                                                          .output
                                                                                          .length -
                                                                                          1
                                                                              ]
                                                                        }
                                                                        alt="output"
                                                                        sizes="100vw"
                                                                  />
                                                            </div>
                                                      )}
                                                      <p className="py-3 text-sm opacity-50">
                                                            status:{" "}
                                                            {prediction.status}
                                                      </p>
                                                </>
                                          )}
                                    </Box>
                              </Flex>
                        </Box>
                  </Center>
            </Box>
      );
}
