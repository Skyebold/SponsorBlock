'use strict';

import Config from "../config";
import Utils from "../utils";
const utils = new Utils();

/**
 * A Description Segment is a chunk of a text description that can be removed.  
 */
export class DescriptionSegment {

	/**
	 * Whether this segment has been submitted to server or was received from server
	 */
	private submitted:boolean;

	/**
	 * Rather than simply storing the string to be redacted, a set of parameters to locate
	 * the string is stored instead.  This prevents the server from needing to store the
	 * exact string, which may be beneficial for better respecting creator's copyrights
	 * and also allowing a creator to update the description elsewhere without invalidating 
	 * the redacted text.
	 */
	private firstCharacters:string;
	private lastCharacters:string;
	private hash:string;
	private length:number;

	public static readonly MAX_SURROUNDING_CHARACTERS_TO_CAPTURE:number = 5;

	private constructor()
	{

	}

	public static createSegmentLocally(highlightedString:string):DescriptionSegment
	{
		if (highlightedString.length < 3)
			return null; // It will not be practical to capture/match against such a short string

		let descriptionSegment = new DescriptionSegment();

		if (highlightedString.length <= DescriptionSegment.MAX_SURROUNDING_CHARACTERS_TO_CAPTURE)		
		{
			// Shorter than max, so capture whole string
			descriptionSegment.firstCharacters = highlightedString; 
			descriptionSegment.lastCharacters = highlightedString; 
		} else {
			// Just grab a short snippet
			descriptionSegment.firstCharacters = highlightedString.substring(0, this.MAX_SURROUNDING_CHARACTERS_TO_CAPTURE);
			descriptionSegment.lastCharacters = highlightedString.substring(highlightedString.length - this.MAX_SURROUNDING_CHARACTERS_TO_CAPTURE);
		}

		descriptionSegment.hash = "TODO";

		descriptionSegment.length = highlightedString.length;

		descriptionSegment.submitted = false;

		return descriptionSegment;
	}

	public static createSegmentFromServer(firstCharacters:string, lastCharacters:string, hash:string, length:number):DescriptionSegment
	{
		let descriptionSegment = new DescriptionSegment();
		descriptionSegment.firstCharacters = firstCharacters;
		descriptionSegment.lastCharacters = lastCharacters;
		descriptionSegment.hash = hash;
		descriptionSegment.length = length;

		descriptionSegment.submitted = true;

		return descriptionSegment;
	}

	/**
	 * Redact this segment from the given input string.  
	 * @param input String to redact this description segment from.
	 * @returns string Redacted string.  If no match, returns the same as input.
	 */
	public redact(input:string):string
	{
		return "TODO / REDACTIONS ARE COOL.";
	}

	public getFirstCharacters():string
	{
		return this.firstCharacters;
	}

	public getLastCharacters():string
	{
		return this.lastCharacters;
	}

	public getHash():string
	{
		return this.hash;
	}

	public getLength():number
	{
		return this.length;
	}
}