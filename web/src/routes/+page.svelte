<script lang="ts">
    import "../app.css";

    let searchQuery = ``;
    let results: Promise<Result[]> | [] = [];

    type Result = {
        key: string;
        imageUrl: string;
        score: number;
        title: string;
        url: string;
    };

    const searchBaseUrl = `/search`;

    onMount(() => {
        fetch(`${searchBaseUrl}?searchQuery=test&abc=${Math.random()}`)
    });
    
    async function search() {
        const searchUrl = `${searchBaseUrl}?${new URLSearchParams({ searchQuery })}`;

        console.log("Searching");

        results = fetch(searchUrl).then(x => x.json())
    }

    import { Dropdown, DropdownItem, Gallery, Heading, P, Search } from "flowbite-svelte";
    import { ImagePlaceholder } from "flowbite-svelte";
    import { Button } from "flowbite-svelte";
    import { ChevronDownOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";

    const examples = [
        "Clouds at sunset",
        "Dog sitting on grass",
        "Person in the snow",
        "Green animal",
        "Person wearing a hat",
        "Birds flying"
    ];
</script>

<svelte:head>
    <title>SvectorDB | Image Search Engine Demo</title>
    <meta
        name="description"
        content="Search for images with natural language using OpenAI's CLIP model and SvectorDB. A demo of how vector embedddings can be used applied to Unsplash's open source dataset" />
</svelte:head>

<div class="row" style="margin-top: 3rem; margin-bottom: 1.5rem;">
    <Heading tag="h1" class="mb-4 text-center" customSize="text-4xl font-extrabold  md:text-5xl lg:text-6xl">Semantic image search</Heading>
    <P class="text-center mb-6 text-lg lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">Search for images with natural language using OpenAI's CLIP model and SvectorDB</P>

    <form on:submit={search}>
        <div class="mb-6 flex gap-2" style="max-width: 80ch; margin: auto; margin-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem;">
            <Search id="search-bar" size="md" bind:value={searchQuery}/>
            <Button on:click={search} color="blue" class="!p-2.5">
                Search
            </Button>
            <Button color="dark" class="!p-2.5">Examples <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white"/></Button>
            <Dropdown>
                {#each examples as example}
                    <DropdownItem on:click={() => { searchQuery = example; search() }}>{example}</DropdownItem>
                {/each}
            </Dropdown>
            
        </div>

        <p style="text-align: center; margin:auto; max-width: 60ch; padding-left: 1rem; padding-right: 1rem;">Embedded and indexed using SvectorDB. Learn more about <a href="https://svectordb.com/?utm_source=demo&utm_medium=web&utm_campaign=image-search-engine" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">SvectorDB</a> or view the <a href="https://github.com/svectordb/image-search-engine-demo" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">source</a>. Images sourced from <a href="https://unsplash.com/data" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">Unsplash's lite dataset</a>.</p>        
    </form>
</div>

<Gallery class="gap-4 grid-cols-2 md:grid-cols-4 justify-items-center">
    {#await results}
        {#each {length: 16} as _, i}
            <ImagePlaceholder imgOnly divClass="max-width" />
        {/each}
    {:then results}
        {#if results.length > 0}
            

            <Gallery
                class="flex flex-col"
                items={results
                    .map((x) => ({ alt: x.title, src: x.imageUrl }))
                    .filter((_, i) => i % 4 == 0)}
            />
            <Gallery
                class="flex flex-col"
                items={results
                    .map((x) => ({ alt: x.title, src: x.imageUrl }))
                    .filter((_, i) => i % 4 == 1)}
            />
            <Gallery
                class="flex flex-col"
                items={results
                    .map((x) => ({ alt: x.title, src: x.imageUrl }))
                    .filter((_, i) => i % 4 == 2)}
            />
            <Gallery
                class="flex flex-col"
                items={results
                    .map((x) => ({ alt: x.title, src: x.imageUrl }))
                    .filter((_, i) => i % 4 == 3)}
            />
        {/if}
    {/await}
</Gallery>
