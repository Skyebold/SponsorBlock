'use strict';

import Config from "../config";
import Utils from "../utils";
import { DescriptionSegment } from "./descriptionSegment";
const utils = new Utils();

/**
 * Collection of Description Segments for the video on this page.
 */
export class DescriptionSegmentManager {

	// Singleton pattern
	private static _instance:DescriptionSegmentManager;
	public static get instance() : DescriptionSegmentManager {
		if (DescriptionSegmentManager._instance == null)
			DescriptionSegmentManager._instance = new DescriptionSegmentManager();
		return DescriptionSegmentManager._instance;
	}

	private descriptionSegmentList:Array<DescriptionSegment> = new Array<DescriptionSegment>();

	public addSegment(descriptionSegment:DescriptionSegment):void
	{
		// TODO check for duplicate first
		console.debug("SBDESCRIPTION - Size before add: " + this.descriptionSegmentList.length);
		this.descriptionSegmentList.push(descriptionSegment);
		console.debug("SBDESCRIPTION - Size after add: " + this.descriptionSegmentList.length);
	}

	public removeSegment(descriptionSegment:DescriptionSegment):void
	{
		this.descriptionSegmentList.filter(test => test != descriptionSegment);
	}

	public getList():Array<DescriptionSegment>
	{
		return this.descriptionSegmentList;
	}

	/**
	 * Video description before redaction is applied
	 */
	private rawDescription:string;

	public applyAllActiveRedactions():void
	{
		// Need to grab description from page element first

		// First, we can't simply grab #description since YT re-uses that ID for some reason
		let descriptionContainer:HTMLElement = null;
		let allDescriptions = document.querySelectorAll<HTMLElement>("#description");
		allDescriptions.forEach(node => {
			if (node.parentElement.id == "content")
			{
				// Found it!
				descriptionContainer = node;
			}
			console.debug("SBDESCRIPTION - parent is " + node.parentElement.id);
		});

		if (this.rawDescription == null)
		{
			//let descriptionContainer = document.getElementById("description");
			if (descriptionContainer == null)
			{
				console.warn("SBDESCRIPTION - Unable to grab description yet...");
				return;
			}
			//this.rawDescription = descriptionContainer.textContent;
			// Nope!  YouTube creates div's for each link, so this needs to be reconvered back to regular text

			/*
			let descriptionSubContainer = descriptionContainer.firstChild;

			this.rawDescription = "";
			descriptionSubContainer.childNodes.forEach(node => {
				this.rawDescription += node.textContent;
			});
			*/
			this.rawDescription = this.recursivelyConvertElementToText(descriptionContainer);
			

			//this.rawDescription = $("#description").text();
		}

		console.debug("SBDESCRIPTION  Video description is: " + this.rawDescription);

		let redactedDescription:string = this.rawDescription;
		this.descriptionSegmentList.forEach(descriptionSegment => {
			redactedDescription = descriptionSegment.redact(redactedDescription);
		});

		// TODO - convert links back to links
		// TODO - output sanitized text
		// Convert linebreaks to <BR>
		redactedDescription = redactedDescription.replace('\n', "<p>");
		descriptionContainer.innerHTML = redactedDescription;
	}

	private recursivelyConvertElementToText(node:Element):string
	{
		console.debug("SBDESCRIPTION - Inside node: " + (node.id));
		if (node.children.length == 0)
		{
			var htmlElement:HTMLElement = node as HTMLElement;
			if (htmlElement != null)	
			{
				if (htmlElement.innerText != null) // TODO - pull full URL's instead of just partial ones
					return htmlElement.innerText;
				return "";
			}

			return ""; //
		} else {
			let childText:string = "";
			for (let i:number=0; i<node.children.length; i++)
			{
				childText += this.recursivelyConvertElementToText(node.children[i]);
			}
			return childText;
		}

		return "";
	}
}