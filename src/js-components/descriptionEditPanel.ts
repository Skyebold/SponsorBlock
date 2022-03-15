'use strict';

import Config from "../config";
import Utils from "../utils";
import { DescriptionSegment } from "./descriptionSegment";
import { DescriptionSegmentManager } from "./descriptionSegmentManager";
const utils = new Utils();

export class DescriptionEditPanel {
	container: HTMLDivElement;
	immediatelyBefore: HTMLElement;

	parent: HTMLElement;
    onMobileYouTube: boolean;
    onInvidious: boolean;

	constructor(parent: HTMLElement, onMobileYouTube: boolean, onInvidious: boolean) {
		// Handle rare case of plugin being reloaded in dev mode:
		this.container = document.getElementById('descriptionEditPanel') as HTMLDivElement;
		if (this.container == null) // Typically would be null as plugin needs to create this
		{
        	this.container = document.createElement('div');
        	this.container.id = 'descriptionEditPanel';
		}

        this.parent = parent;
		this.immediatelyBefore = parent;
        this.onMobileYouTube = onMobileYouTube;
        this.onInvidious = onInvidious;

        this.createElement(parent);
		this.writeContents();
    }

	createElement(parent: HTMLElement): void {
        this.parent = parent;

		/*
        if (this.onMobileYouTube) {
            parent.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            parent.style.opacity = "1";
            
            this.container.style.transform = "none";
        } else if (!this.onInvidious) {
            // Hover listener
            this.parent.addEventListener("mouseenter", () => this.container.classList.add("hovered"));

            this.parent.addEventListener("mouseleave", () => this.container.classList.remove("hovered"));
        }
		*/

        // On the seek bar
        //this.parent.prepend(this.container);

		console.debug("SBDESCRIPTION - creating new description panel inside element: " + this.parent.id);

		//document.body.insertBefore(this.container, this.parent);
		this.parent.append(this.container);
    }

	writeContents():void
	{
		//let textElement = document.createTextNode("RAAAWR");
		//this.container.appendChild(textElement);

		let headerText:string = "";
			// "Description has no sponsor redactions (open tools)"
			// "Description has no sponsor redactions (hide tools)"
			// "Sponsor redacted from description (toggle) (open tools)"
			// "Sponsor unredacted from description (toggle) (open tools)"

		let segments = DescriptionSegmentManager.instance.getList();

		let toolsText:string = "";
		
		// If any currently flagged segments:	
		if (segments.length > 0)
		{
			toolsText +=  "<p>Flagged segments:<table><tr><th>ID</th><th>Text</th><th>Actions</th></tr>";
			segments.forEach(segment => {
				toolsText += "<tr><td>";
				toolsText += "TBD" // ID
				toolsText += "</td><td>"
				toolsText += segment.getUserReadableText(); // TODO, sanitize HTML->TXT
				toolsText += "</td><td>"
				toolsText += "actions";
				toolsText += "</td></tr>"
				//toolsText += segment.getHash();
				// TODO, options and maybe move this whole thing to a table for easier readability
				//toolsText += "<li>qwer [Type: Sponsor] [Remove] [Vote Up] [Vote Down]</li>";
				//toolsText += "</li>";
			});
			
			toolsText += "</table>";
		} else {
			// No flagged segments, encourage user to flag
			toolsText += "<p>Remove sponsored messages from video descriptions!  To get started, select a string of text " + 
			"in the video description, then click flag segment." 
		}

		toolsText += "<p><button id='sponsorDescriptionFlag'>Flag selected text</button>";
		
		/*
		this.container.innerHTML = "Description has no sponsor redactions yet (open tools)" + 
			"<div></div>";
			*/
		
		this.container.innerHTML = toolsText; // TOdo, change to be a header + toggleable tools
		console.debug("SBDESCRIPTION - Create description wrote contents.");

		/*
		let test:HTMLElement = this.container;
		while (test != null)
		{
			console.debug("SBDESCRIPTION > " + test.id);
			test = test.parentElement;
		}
		*/

		this.registerButtonListeners();
	}

	private registerButtonListeners():void {
		var flagButton:HTMLButtonElement = document.getElementById("sponsorDescriptionFlag") as HTMLButtonElement;
		flagButton.addEventListener("click", (e:Event) => 
		{
			console.debug("SBDESCRIPTION - sponsorDescriptionFlag clicked.");

			let selection:string = "";

			// Get highlight text:
			if (window.getSelection) {
				selection = window.getSelection().toString();
			} 

			if (selection.length == 0)
				window.alert("Please select some text that should be removed first.");
			else
			{
				let newSelection:DescriptionSegment = DescriptionSegment.createSegmentLocally(selection);
				DescriptionSegmentManager.instance.addSegment(newSelection);
				this.writeContents(); // update tools panel with new description segement data
			}
		});
	}

	public static findParentForDescriptionEditPanel():HTMLDivElement
	{
		const progressElementSelectors = [
			// For mobile YouTube
			////".progress-bar-background",
			// For YouTube
			////".ytp-progress-bar-container",
			////".no-model.cue-range-markers",
			//"#collapsible",
			//"#container" // collapsile won't be shown if the description isn't long enough, so use this as a fallback
			//"#meta-contents"
			//"#meta-contents" 
			//".ytd-video-secondary-info-renderer[id='container']" // This will put it outside
			".ytd-video-secondary-info-renderer[id='description']"
			// For Invidious/VideoJS
			////".vjs-progress-holder"
		];

		for (const selector of progressElementSelectors) {
			let el = document.querySelector<HTMLElement>(selector);

			if (el) {
				// Description found; grab its parent
				//el = el.parentElement;
				return el as HTMLDivElement;
			}
		}
	}
}