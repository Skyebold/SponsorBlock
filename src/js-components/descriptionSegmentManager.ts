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

		this.applyAllActiveRedactions();
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

		console.debug("SBDESCRIPTION  Redacted Video description is: " + redactedDescription);

		// paragraphs that are empty should be removed		
		//redactedDescription = redactedDescription.replace(new RegExp('(\n){3,}', 'gim') , '');

		console.debug("SBDESCRIPTION  Extra newlined video description is: " + redactedDescription);

		// Convert linebreaks to <BR>
		redactedDescription = redactedDescription.replace(/\n/g, "<br>");

		// TODO - convert links back to links
		redactedDescription = this.linkify(redactedDescription);

		// TODO - output sanitized text

		// Update user-displayed description
		descriptionContainer.innerHTML = redactedDescription;
	}

	private linkify(inputText:string):string
	{
		// based on https://stackoverflow.com/questions/49634850/convert-plain-text-links-to-clickable-links

		var replacedText, replacePattern1, replacePattern2, replacePattern3;
	
		//URLs starting with http://, https://, or ftp://
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
	
		//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
		replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
	
		//Change email addresses to mailto:: links.
		replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
		replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
	
		return replacedText;
	}

	private recursivelyConvertElementToText(node:Element):string
	{
		console.debug("SBDESCRIPTION - Inside node: " + (node.id));
		if (node.children.length == 0)
		{
			var htmlElement:HTMLElement = node as HTMLElement;
			if (htmlElement != null)	
			{
				if (htmlElement.nodeName == "A") // Link
				{
					// Parse URLs
					let rawUrl:string = (htmlElement as HTMLLinkElement).href;
					let displayUrl:string = htmlElement.innerText;

					// rawUrl most likely contains a link to YouTube's redirect system instead of a direct site link

					// Get real URL -- this circumvents YouTube's redirect system because description subsystem only
					// parses text, not URLs (some mapping would be needed to retain short URLS).  It would be best
					// not to store youtube redirect URLs since youtube may change their redirect algo at some point,
					// and break every URL stored in the database.

					// RawURL probably looks like:
					// https://www.youtube.com/redirect?event=video_description&redir_token=LONGTEXT&q=https%3A%2F%2Fwww.website.com
					let url:URL = new URL(rawUrl);
					let realLinkAddress:string = url.searchParams.get("q");

					// NOTE: This does not shorten the url.  If we want to support that, we need to create in memory
					// some kind of display<->url mapping so urls can still be parsed out.
					// TODO: Maybe support shortened URLs?  (Low priority)
					/*
					if (realLinkAddress != null)
						return "<a href='" + realLinkAddress + "' + target='_blank'>" + realLinkAddress + "</a>"; 
					else
						return "<a href='" + rawUrl + "' + target='_blank'>" + displayUrl + "</a>"; 
						*/
					if (realLinkAddress != null)
						return realLinkAddress;
					else
						return rawUrl;  // Isn't using YT redirect, so probably a YT link
				}
				else if (htmlElement.innerText != null) 
					return htmlElement.innerText; // Regular text
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