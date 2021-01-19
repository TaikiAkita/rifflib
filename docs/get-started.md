## Get started

### Basic concepts

This chapter describes some basic concepts.

#### Accessor

Accessors are used by the serializer/deserializer to read/write data from/to specific location (e.g. file, network stream or memory). There are two types of accessors:

 - Read accessor
 - Write accessor

The read accessor (classes that implemented <i>IRIFFReadAccessor</i> interface, including <i>RIFFFileReadAccessor</i>, <i>RIFFMemoryReadAccessor</i> and <i>RIFFStreamReadAccessor</i>) abstracts the operation interface of reading data from specific location.

The write accessor (classes that implemented <i>IRIFFWriteAccessor</i> interface, including <i>RIFFFileWriteAccessor</i> and <i>RIFFMemoryWriteAccessor</i>).

##### Create a memory read accessor

<i>RIFFMemoryReadAccessor</i> class provides the ability to read data from fixed memory location (i.e. a <i>Buffer</i> object). To create a memory read accessor, use <i>RIFFMemoryReadAccessor.FromBuffer(buf)</i> method:

```
let buf = Buffer.from([1, 2, 3, 4, 5]);
let ra = RIFFMemoryReadAccessor.FromBuffer(buf);
```

##### Create a file read accessor

<i>RIFFFileReadAccessor</i> class provides the ability to read data from filesystem. To create a file read accessor, use <i>RIFFFileReadAccessor.Open(path[, cancellator])</i> method:

```
let ra = RIFFFileReadAccessor.Open("test.wav");
```

To dispose the file read accessor, use <i>ra.end()</i> method:

```
await ra.end();
```

##### Create a stream read accessor.

<i>RIFFStreamReadAccessor</i> class simulates a stream. All read operations to this type of accessor would be blocked until data is available (or stream closes).

Here is an example:

```
//  Create a stream read accessor.
let ra = RIFFStreamReadAccessor.New();

//  Feed byte 0~2 on 1000ms.
setTimeout(function() {
    ra.append(Buffer.from([1, 2, 3]));
}, 1000);

//  Feed byte 3~5 on 2000ms.
setTimeout(function() {
    ra.append(Buffer.from([4, 5, 6]));
}, 2000);

//  This statement would be blocked until 1000ms.
await ra.read(0 /*  offset  */, 3 /*  length  */);

//  This statement would be blocked until 2000ms.
await ra.read(1 /*  offset  */, 3 /*  length  */);
```

##### Read data from read accessors

To read data, use <i>ra.read(address, length[, cancellator])</i> method (where <i>ra</i> is an instance of a read accessor class), like:

```
let data = await ra.read(0, 3);  //  Read byte 0~2.
```

##### Get slice of the read accessor

The read accessor provides *ra.sub(offset)* method that can get a slice of the original read accessor. The sliced and the original read accessor shares the same memory or I/O space but may have different offset.

Here is an example:

```
let buf = Buffer.from([1, 2, 3, 4, 5]);
let bslc = buf.sub(1);
console.log(await bslc.read(0, 3));  //  <Buffer 02 03 04>
```

##### Create a memory write accessor

<i>RIFFMemoryWriteAccessor</i> class provides the ability to write data to fixed memory location (i.e. a <i>Buffer</i> object). To create a memory write accessor, use <i>RIFFMemoryWriteAccessor.New()</i> method:

```
let wa = RIFFMemoryWriteAccessor.New();
```

Note that there is no need to specify the memory size. The memory size is currently managed by the accessor automatically.

Once you finished all write operations, use <i>wa.end()</i> method to get the memory buffer.

```
let buf = wa.end();
console.log(buf);  //  <Buffer ...>
```

##### Create a file write accessor.

<i>RIFFFileWriteAccessor</i> class provides the ability to write data from filesystem. To create a file write accessor, use <i>RIFFFileWriteAccessor.Open(path[, cancellator])</i> method:

```
let wa = await RIFFFileWriteAccessor.Open("test.wav");
```

If the file specified exists, its content would be cleared. If the file doesn't exist, it would be created.



To dispose the file write accessor, use <i>wa.end()</i> method:

```
await wa.end();
```

##### Write data to write accessors

To write data, use <i>wa.write(address, data[, cancellator])</i> method (where <i>wa</i> is an instance of a write accessor class), like:

```
await wa.write(0, Buffer.from([1, 2, 3]));
```

##### Get slice of the write accessor

Like read accessor, you can also use <i>wa.sub(offset)</i> method to get a slice of specified write accessor.

Here is an example:

```
let wa = RIFFMemoryWriteAccessor.New();
await wa.write(0, Buffer.from([1, 2, 3, 4, 5]));
await wa.sub(1).write(0, Buffer.from([4, 3, 2]));
console.log(wa.end());  //  <Buffer 01 04 03 02 05>
```

#### FOURCC structure

The [FOURCC ("four-character code")](https://en.wikipedia.org/wiki/FourCC) is a sequence of four bytes. In RIFF, FOURCC is used to represent chunk ID, list/form type and some other similar structures.

The <i>RIFFFourCC</i> class is used to represents the FOURCC structure.

A <i>RIFFFourCC</i> can be created from either a <i>Buffer</i> object or a <i>String</i> object:

```
//  From Buffer object.
let cc = new RIFFFourCC(Buffer.from("WAVE", "ascii"));
```

```
//  From String object.
let cc = RIFFFourCC.FromString("WAVE");
```

If you create a <i>RIFFFourCC</i> object from <i>Buffer</i> object, the length of the <i>Buffer</i> object must be 4. If you create from <i>String</i> object, the length of the string must be lower than or equal to 4. Padding spaces would be added automatically.

#### Element

An element (instance of class that implements <i>IRIFFElement</i> interface) represents a RIFF chunk.

##### Raw (general) element

A raw(general) RIFF chunk can be represented by <i>RIFFRawElement</i> class instance, to construct such instance, the chunk ID, the read accessor to the chunk data and the length of the chunk data are needed. Here is an example:

```
let data = Buffer.from("Chunk data");
let element = new RIFFRawElement(RIFFFourCC.FromString("TEST"));
element.setDataAccessor(RIFFMemoryReadAccessor.FromBuffer(data));
element.setDataLength(data.length);
```

##### List/form element.

A RIFF list/form chunk can be represented by <i>RIFFListElement</i> and <i>RIFFFormElement</i> respectively and they provides almost the same sets of interface.

To create an element that represents a RIFF list:

```
let element = new RIFFListElement(RIFFFourCC.FromString("INFO"));
```

To create an element that represents a RIFF form:

```
let element = new RIFFFormElement(RIFFFourCC.FromString("WAVE"));
```

Child elements can be added/removed dynamically:

```
let child = ... /*  ...any other element...  */;
element.addChild(child);
```

```
//  This would remove the child at index 1 (the second child element).
element.removeChild(1);
```

##### NULL-terminated string (ZSTR)

A RIFF ZSTR chunk can be represented by <i>RIFFZStringElement</i>.

To create such element:

```
let iart = new RIFFZStringElement(RIFFFourCC.FromString("IART"));
iart.setStringBytes(Buffer.from("Artist name."));
```

In this example, we created an element that represents "Artist name."Z.

#### Serialization

To serialize an element, simply use the <i>element.serialize([options, [cancellator]])</i> method (where <i>element</i> is an instance of class implements <i>IRIFFElement</i> interface).

```
let serialized = await element.serialize();
```

After serialization, you can use a write accessor to write the serialized RIFF chunk to specified location.

For example, to write the chunk to a RIFF file:

```
let wa = await RIFFFileWriteAccessor.Open("test.wav");
await serialized.write(wa);
await wa.end();
```

#### Deserialization

To deserialize an element, you have to use particular deserializer which is an instance of class that implements <i>IRIFFElementDeserializer</i>.

##### Raw (general) element deserialization

Use <i>RIFFRawElementDeserializer</i> class to deserialize a RIFF chunk with specified chunk ID.

For example, to deserialize a chunk with chunk ID 'INAM':

```
let ra = ...;
let dsrl = new RIFFRawElementDeserializer(RIFFFourCC.FromString("INAM"));
let element = (await dsrl.deserialize(ra)).getElement();
```

##### List/form element deserialization.

Use <i>RIFFListElementDeserializer</i> and <i>RIFFFormElementDeserializer</i> to deserialize a RIFF list/form chunk respectively.

First, you have to create a list/form deserializer with list/form type.

```
//  For RIFF list:
let dsrl = new RIFFListElementDeserializer(RIFFFourCC.FromString(...List type...));
```

```
//  For RIFF form:
let dsrl = new RIFFFormElementDeserializer(RIFFFourCC.FromString(...List type...));
```

Then you can add some deserializer to deserialize particular child element of the list/form element:

```
let dsrl_inam = new RIFFZStringElementDeserializer(RIFFFourCC.FromString("INAM"));
let dsrl_icrd = new RIFFZStringElementDeserializer(RIFFFourCC.FromString("ICRD"));
dsrl.useChildDeserializer(dsrl_inam);
dsrl.useChildDeserializer(dsrl_icrd);
```

Note that if a child element (chunk) has no matched deserializer, it would be deserialized to a <i>RIFFRawElement</i> element.

Finally, you can deserialize with the deserializer:

```
let element = (await dsrl.deserialize(ra)).getElement();
```

##### NULL-terminated string (ZSTR) deserialization.

Use <i>RIFFZStringElementDeserializer</i> to deserialize a NULL-terminated string (ZSTR) element.

See the example code above.

