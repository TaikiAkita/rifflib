## Application Programming Interface (API) Reference

### (Module) Endianness

#### (Constant) BIG_ENDIAN

Big endian.

#### (Constant) LITTLE_ENDIAN

Little endian.

### (Module) IO

#### (Class) IRIFFReadAccessor

Interface of all RIFF read accessor classes.

##### (Method) IRIFFReadAccessor.prototype.read(address, length[, cancellator])

Read data asynchronously.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Type</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td><i>RIFFOperationCancelledError</i></td><td>The cancellator was activated.</td></tr>
<tr><td rowspan="2"><i>RIFFParameterError</i></td><td>Invalid data address.</td></tr>
<tr><td>Invalid data length.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>address</i></td><td><i>Number</i></td><td>The data address.</td></tr>
<tr><td><i>length</i></td><td><i>Number</i></td><td>The data length.</td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;Buffer&gt;</i></td><td>The promise object (resolves with the data if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

##### (Method) IRIFFReadAccessor.prototype.sub(offset)

Get sub accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFParameterError</i></td><td>Invalid offset.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>offset</i></td><td><i>Number</i></td><td>The address offset.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>IRIFFReadAccessor</i></td><td>The sub accessor.</td></tr>
</tbody>
</table>

#### (Class) IRIFFWriteAccessor

Interface of all RIFF write accessor classes.

##### (Method) IRIFFWriteAccessor.prototype.write(address, data[, cancellator])

Write data asynchronously.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td><i>RIFFOperationCancelledError</i></td><td>The cancellator was activated.</td></tr>
<tr><td><i>RIFFParameterError</i></td><td>Invalid data address.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>address</i></td><td><i>Number</i></td><td>The data address.</td></tr>
<tr><td><i>data</i></td><td><i>Buffer</i></td><td>The data.</td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;void&gt;</i></td><td>The promise object (resolves if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

##### (Method) IRIFFWriteAccessor.prototype.sub(offset)

Get sub accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFParameterError</i></td><td>Invalid offset.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>offset</i></td><td><i>Number</i></td><td>The address offset.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>IRIFFWriteAccessor</i></td><td>The sub accessor.</td></tr>
</tbody>
</table>

#### (Class) RIFFFileReadAccessor : IRIFFReadAccessor

RIFF file read accessor.

##### (Method) RIFFFileReadAccessor.prototype.getFileDescriptor()

Get the file descriptor.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The file descriptor.</td></tr>
</tbody>
</table>

##### (Method) RIFFFileReadAccessor.prototype.end()

End the accessor.

<u>Note(s)</u>:
 -  All sub accessors would also be ended.
 - This method is only available to the top-level accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td rowspan="2"><i>RIFFInvalidOperationError</i></td><td>The accessor was already ended.</td></tr>
<tr><td>Not top-level accessor.</td></tr>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;void&gt;</i></td><td>The promise object (resolves if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

##### (Static Method) RIFFFileReadAccessor.Open(path[, cancellator])

Create a new RIFF file read accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td><i>RIFFOperationCancelledError</i></td><td>The cancellator was activated.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>path</i></td><td><i>String</i></td><td>The file path.</td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;RIFFFileReadAccessor&gt;</i></td><td>The promise object (resolves with the file read accessor if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

#### (Class) RIFFFileWriteAccessor : IRIFFWriteAccessor

RIFF file write accessor.

##### (Method) RIFFFileWriteAccessor.prototype.getFileDescriptor()

Get the file descriptor.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The file descriptor.</td></tr>
</tbody>
</table>

##### (Method) RIFFFileWriteAccessor.prototype.write(address, data[, cancellator])

Write data asynchronously.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td><i>RIFFOperationCancelledError</i></td><td>The cancellator was activated.</td></tr>
<tr><td><i>RIFFParameterError</i></td><td>Invalid data address.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>address</i></td><td><i>Number</i></td><td>The data address.</td></tr>
<tr><td><i>data</i></td><td><i>Buffer</i></td><td>The data.</td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;void&gt;</i></td><td>The promise object (resolves if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

##### (Method) RIFFFileWriteAccessor.prototype.end()

End the accessor.

<u>Note(s)</u>:
 -  All sub accessors would also be ended.
 - This method is only available to the top-level accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td rowspan="2"><i>RIFFInvalidOperationError</i></td><td>The accessor was already ended.</td></tr>
<tr><td>Not top-level accessor.</td></tr>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;void&gt;</i></td><td>The promise object (resolves if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

#### (Class) RIFFMemoryReadAccessor : IRIFFReadAccessor

RIFF memory read accessor.

##### (Static Method) RIFFMemoryReadAccessor.FromBuffer(buf)

Create a new memory read accessor.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>buf</i></td><td><i>Buffer</i></td><td>The memory buffer.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFMemoryReadAccessor</i></td><td>The memory read accessor.</td></tr>
</tbody>
</table>

#### (Class) RIFFMemoryWriteAccessor : IRIFFWriteAccessor

RIFF memory write accessor.

##### (Method) RIFFMemoryWriteAccessor.prototype.end()

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td rowspan="2"><i>RIFFInvalidOperationError</i></td><td>The accessor was already ended.</td></tr>
<tr><td>Not top-level accessor.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Buffer</i></td><td>The memory bytes.</td></tr>
</tbody>
</table>

##### (Static Method) RIFFMemoryWriteAccessor.New()

Create a new (top-level) memory write accessor.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFMemoryWriteAccessor</i></td><td>The memory write accessor.</td></tr>
</tbody>
</table>

#### (Class) RIFFStreamReadAccessor : IRIFFReadAccessor

RIFF stream read accessor.

##### (Method) RIFFStreamReadAccessor.prototype.append(bytes)

Append bytes to the stream.

<u>Note(s)</u>:
 -  This method is only available to the top-level accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td rowspan="2"><i>RIFFInvalidOperationError</i></td><td>The stream was already ended.</td></tr>
<tr><td>Not top-level accessor.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>bytes</i></td><td><i>Buffer</i></td><td>The bytes.</td></tr>
</tbody>
</table>

##### (Method) RIFFStreamReadAccessor.prototype.end()

End the stream.

<u>Note(s)</u>:
 -  All sub accessors would also be ended.
 - This method is only available to the top-level accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td rowspan="2"><i>RIFFInvalidOperationError</i></td><td>The stream was already ended.</td></tr>
<tr><td>Not top-level accessor.</td></tr>
</tbody>
</table>

##### (Static Method) RIFFStreamReadAccessor.New()

Create a new (top-level) stream read accessor.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFStreamReadAccessor</i></td><td>The stream read accessor.</td></tr>
</tbody>
</table>

### (Module) IO.Utils

#### (Function) CopyBetweenAccessors(src, dst, length[, blksz = 4096[, cancellator]])

Copy between accessors.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td rowspan="2"><i>RIFFParameterError</i></td><td>Invalid length.</td></tr>
<tr><td>Invalid block size.</td></tr>
<tr><td><i>RIFFOperationCancelledError</i></td><td>The cancellator was activated.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>src</i></td><td><i>IRIFFReadAccessor</i></td><td>The source accessor.</td></tr>
<tr><td><i>dst</i></td><td><i>IRIFFWriteAccessor</i></td><td>The destination accessor.</td></tr>
<tr><td><i>blksz</i></td><td><i>Number</i></td><td>The I/O block size.</td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;void&gt;</i></td><td>The promise object (resolves if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

### (Module) Blocks

#### (Class) RIFFFourCC

RIFF four-character code (FOURCC) structure.

##### (Constructor) new RIFFFourCC(fourcc)

New object.

<u>Note(s)</u>:
 -  The length of the FOURCC bytes must be 4.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFParameterError</i></td><td>Invalid FOURCC bytes.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>fourcc</i></td><td><i>Buffer</i></td><td>The FOURCC bytes.</td></tr>
</tbody>
</table>

##### (Method) RIFFFourCC.prototype.getBytes()

Get the FOURCC bytes.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Buffer</i></td><td>The FOURCC bytes.</td></tr>
</tbody>
</table>

##### (Method) RIFFFourCC.prototype.toString([trimSpace = true])

Convert to string.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>trimSpace</i></td><td><i>Boolean</i></td><td>True if the padding space should be trimmed.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>String</i></td><td>The string.</td></tr>
</tbody>
</table>

##### (Static Method) RIFFFourCC.FromString(str)

Create a FOURCC from string.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td rowspan="2"><i>RIFFParameterError</i></td><td>The string is too long.</td></tr>
<tr><td>The string contains invalid codepoint.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>str</i></td><td><i>String</i></td><td>The string.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFFourCC</i></td><td>The FOURCC structure.</td></tr>
</tbody>
</table>

### (Module) Tree

#### (Class) IRIFFElement

Interface of all RIFF element classes.

##### (Method) IRIFFElement.prototype.getName()

Get the element name.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFFourCC</i></td><td>The element name.</td></tr>
</tbody>
</table>

##### (Method) IRIFFElement.prototype.serialize([options, [cancellator]])

Serialize element.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFOperationCancelledError</i></td><td>The cancellator was activated.</td></tr>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td><i>RIFFSerializeError</i></td><td>Serialize error.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>options</i></td><td><i>RIFFElementSerializerOption</i></td><td>The options.</td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;RIFFElementSerializerOutput&gt;</i></td><td>The promise object (resolves with the serialization output if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

#### (Class) IRIFFElementDeserializer

Interface of all RIFF element deserializer classes.

##### (Method) IRIFFElementDeserializer.prototype.getAcceptableName()

Get the element name that can be accepted by the deserializer.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFFourCC</i></td><td>The element name.</td></tr>
</tbody>
</table>

##### (Method) IRIFFElementDeserializer.prototype.deserialize(accessor[, start = 0[, end = -1[, options[, cancellator]]]])

Deserialize element.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td><i>RIFFDeserializeError</i></td><td>Deserialize error.</td></tr>
<tr><td rowspan="2"><i>RIFFParameterError</i></td><td>Invalid beginning offset.</td></tr>
<tr><td>Invalid ending offset.</td></tr>
<tr><td><i>RIFFOperationCancelledError</i></td><td>The cancellator was activated.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>start</i></td><td><i>Number</i></td><td>The deserialization beginning offset.</td></tr>
<tr><td><i>end</i></td><td><i>Number</i></td><td>The deserialization ending offset.<br/><ul><li>-1 if ending offset is not set.</li><li>Any value larger than the beginning offset if ending offset is set.</li></ul></td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;RIFFElementDeserializerOutput&gt;</i></td><td>The promise object (resolves with the deserialization output if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

#### (Class) RIFFElementDeserializerOption

RIFF element deserializer options.

##### (Constructor) new RIFFElementDeserializerOption()

New object.

##### (Method) RIFFElementDeserializerOption.prototype.isWordAligned()

Get whether word alignment is enabled.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Boolean</i></td><td>True if so.</td></tr>
</tbody>
</table>

##### (Method) RIFFElementDeserializerOption.prototype.setWordAligned(aligned)

Set whether word alignment is enabled.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>aligned</i></td><td><i>Boolean</i></td><td>True if word alignment is enabled.</td></tr>
</tbody>
</table>

##### (Method) RIFFElementDeserializerOption.prototype.getEndianness()

Get the endianness.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The endianness (either <i>BIG_ENDIAN</i> or <i>LITTLE_ENDIAN</i>).</td></tr>
</tbody>
</table>

##### RIFFElementDeserializerOption.prototype.setEndianness(edn)

Set the endianness.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFParameterError</i></td><td>Invalid endianness.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>edn</i></td><td><i>Number</i></td><td>The endianness (either <i>BIG_ENDIAN</i> or <i>LITTLE_ENDIAN</i>).</td></tr>
</tbody>
</table>

#### (Class) RIFFElementDeserializerOutput

RIFF element deserializer output.

##### (Method) RIFFElementDeserializerOutput.prototype.getElement()

Get the element.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>IRIFFElement</i></td><td>The element.</td></tr>
</tbody>
</table>

##### (Method) RIFFElementDeserializerOutput.prototype.getNextOffset()

Get the offset of the next element.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The offset.</td></tr>
</tbody>
</table>

#### (Class) RIFFElementSerializerOption

RIFF element serializer options.

##### (Constructor) new RIFFElementSerializerOption()

New object.

##### (Method) RIFFElementSerializerOption.prototype.isWordAligned()

Get whether word alignment is enabled.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Boolean</i></td><td>True if so.</td></tr>
</tbody>
</table>

##### (Method) RIFFElementSerializerOption.prototype.setWordAligned(aligned)

Set whether word alignment is enabled.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>aligned</i></td><td><i>Boolean</i></td><td>True if word alignment is enabled.</td></tr>
</tbody>
</table>

##### (Method) RIFFElementSerializerOption.prototype.getEndianness()

Get the endianness.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The endianness (either <i>BIG_ENDIAN</i> or <i>LITTLE_ENDIAN</i>).</td></tr>
</tbody>
</table>

##### RIFFElementSerializerOption.prototype.setEndianness(edn)

Set the endianness.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFParameterError</i></td><td>Invalid endianness.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>edn</i></td><td><i>Number</i></td><td>The endianness (either <i>BIG_ENDIAN</i> or <i>LITTLE_ENDIAN</i>).</td></tr>
</tbody>
</table>

#### (Class) RIFFElementSerializerOutput

RIFF element serializer output.

##### (Method) RIFFElementSerializerOutput.prototype.getDataAccessor()

Get the serialized data accessor.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>IRIFFReadAccessor</i></td><td>The serialized data accessor.</td></tr>
</tbody>
</table>

##### (Method) RIFFElementSerializerOutput.prototype.getDataLength()

Get the serialized data length.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The serialized data length.</td></tr>
</tbody>
</table>

##### (Method) RIFFElementSerializerOutput.prototype.write(accessor[, offset = 0[, cancellator]])

Write serialized data through specified write accessor.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFIOError</i></td><td>I/O error.</td></tr>
<tr><td><i>RIFFParameterError</i></td><td>Invalid offset.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>accessor</i></td><td><i>IRIFFWriteAccessor</i></td><td>The write accessor.</td></tr>
<tr><td><i>offset</i></td><td><i>Number</i></td><td>The write offset.</td></tr>
<tr><td><i>cancellator</i></td><td><i>ConditionalSynchronizer</i></td><td>The cancellator.</td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Promise&lt;void&gt;</i></td><td>The promise object (resolves if succeed, rejects if error occurred).</td></tr>
</tbody>
</table>

#### (Class) RIFFRawElement : IRIFFElement

RIFF raw element.

##### (Constructor) new RIFFRawElement(name)

New object.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>name</i></td><td><i>RIFFFourCC</i></td><td>The element name.</td></tr>
</tbody>
</table>

##### (Method) RIFFRawElement.prototype.getDataAccessor()

Get the data accessor.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>IRIFFReadAccessor</i></td><td>The data accessor.</td></tr>
</tbody>
</table>

##### (Method) RIFFRawElement.prototype.setDataAccessor(da)

Set the data accessor.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>da</i></td><td><i>IRIFFReadAccessor</i></td><td>The data accessor.</td></tr>
</tbody>
</table>

##### (Method) RIFFRawElement.prototype.getDataLength()

Get the data length.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The data length.</td></tr>
</tbody>
</table>

##### (Method) RIFFRawElement.prototype.setDataLength(dlen)

Set the data length.

<u>Note(s)</u>:
 -  The data length must be a non-negative integer.
 -  The data length must be lower than or equal to 0xFFFFFFFF.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFParameterError</i></td><td>Invalid data length.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>dlen</i></td><td><i>Number</i></td><td>The data length.</td></tr>
</tbody>
</table>

#### (Class) RIFFRawElementDeserializer : IRIFFElementDeserializer

RIFF raw element deserializer.

##### (Constructor) new RIFFRawElementDeserializer(acptName)

New object.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>acptName</i></td><td><i>RIFFFourCC</i></td><td>The acceptable element name.</td></tr>
</tbody>
</table>

#### (Class) RIFFFormElement : IRIFFElement

RIFF form element.

##### (Constructor) new RIFFFormElement(formType)

New object.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>formType</i></td><td><i>RIFFFourCC</i></td><td>The form type.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElement.prototype.getFormType()

Get the form type.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFFourCC</i></td><td>The form type.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElement.prototype.addChild(elem)

Add a child element to the tail of the children list.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>elem</i></td><td><i>IRIFFElement</i></td><td>The child element.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElement.prototype.insertChild(index, elem)

Insert a child element to specified index of the children list.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The insertion index.</td></tr>
<tr><td><i>elem</i></td><td><i>IRIFFElement</i></td><td>The child element.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElement.prototype.removeChild(index)

Remove a child element at specified index of the children list.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The index.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElement.prototype.removeAllChildren()

Remove all children elements.

##### (Method) RIFFFormElement.prototype.getChildAt(index)

Get the child element at specified index.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The index.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElement.prototype.setChildAt(index, elem)

Set the child element at specified index.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The index.</td></tr>
<tr><td><i>elem</i></td><td><i>IRIFFElement</i></td>The new children element.<td></td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>IRIFFElement</i></td><td>The old children element.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElement.prototype.getChildrenCount()

Get the count of children elements.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The count.</td></tr>
</tbody>
</table>

#### (Class) RIFFFormElementDeserializer : IRIFFElementDeserializer

RIFF form element deserializer.

##### (Constructor) new RIFFFormElementDeserializer(acptFormType)

New object.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>acptFormType</i></td><td><i>RIFFFourCC</i></td><td>The acceptable form type.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElementDeserializer.prototype.getAcceptableFormType()

Get the form type that can be accepted by the deserializer.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFFourCC</i></td><td>The form type.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElementDeserializer.prototype.useChildDeserializer(dsrl)

Use specified child deserializer.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFDeserializerExistedError</i></td><td>Deserializer existed.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>dsrl</i></td><td><i>IRIFFElementDeserializer</i></td><td>The child deserializer.</td></tr>
</tbody>
</table>

##### (Method) RIFFFormElementDeserializer.prototype.unuseChildDeserializer(dsrl)

Unuse specified child deserializer.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFDeserializerNotExistsError</i></td><td>Deserializer doesn't exist.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>dsrl</i></td><td><i>IRIFFElementDeserializer</i></td><td>The child deserializer.</td></tr>
</tbody>
</table>

#### (Class) RIFFListElement : IRIFFElement

RIFF list element.

##### (Constructor) new RIFFListElement(listType)

New object.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>listType</i></td><td><i>RIFFFourCC</i></td><td>The list type.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElement.prototype.getListType()

Get the list type.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFFourCC</i></td><td>The list type.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElement.prototype.addChild(elem)

Add a child element to the tail of the children list.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>elem</i></td><td><i>IRIFFElement</i></td><td>The child element.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElement.prototype.insertChild(index, elem)

Insert a child element to specified index of the children list.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The insertion index.</td></tr>
<tr><td><i>elem</i></td><td><i>IRIFFElement</i></td><td>The child element.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElement.prototype.removeChild(index)

Remove a child element at specified index of the children list.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The index.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElement.prototype.removeAllChildren()

Remove all children elements.

##### (Method) RIFFListElement.prototype.getChildAt(index)

Get the child element at specified index.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The index.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElement.prototype.setChildAt(index, elem)

Set the child element at specified index.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFInvalidIndexError</i></td><td>Invalid index.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>index</i></td><td><i>Number</i></td><td>The index.</td></tr>
<tr><td><i>elem</i></td><td><i>IRIFFElement</i></td>The new children element.<td></td></tr>
</tbody>
</table>

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>IRIFFElement</i></td><td>The old children element.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElement.prototype.getChildrenCount()

Get the count of children elements.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>Number</i></td><td>The count.</td></tr>
</tbody>
</table>

#### (Class) RIFFListElementDeserializer : IRIFFElementDeserializer

RIFF list element deserializer.

##### (Constructor) new RIFFListElementDeserializer(acptListType)

New object.

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>acptListType</i></td><td><i>RIFFFourCC</i></td><td>The acceptable list type.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElementDeserializer.prototype.getAcceptableListType()

Get the list type that can be accepted by the deserializer.

<u>Return</u>:

<table>
<thead>
<th>Return Type</th><th>Return Description</th>
</thead>
<tbody>
<tr><td><i>RIFFFourCC</i></td><td>The list type.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElementDeserializer.prototype.useChildDeserializer(dsrl)

Use specified child deserializer.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFDeserializerExistedError</i></td><td>Deserializer existed.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>dsrl</i></td><td><i>IRIFFElementDeserializer</i></td><td>The child deserializer.</td></tr>
</tbody>
</table>

##### (Method) RIFFListElementDeserializer.prototype.unuseChildDeserializer(dsrl)

Unuse specified child deserializer.

<u>Exception(s)</u>:

<table>
<thead>
<th>Exception Class</th><th>Exception Description</th>
</thead>
<tbody>
<tr><td><i>RIFFDeserializerNotExistsError</i></td><td>Deserializer doesn't exist.</td></tr>
</tbody>
</table>

<u>Parameter(s)</u>:

<table>
<thead>
<th>Parameter Name</th><th>Parameter Type</th><th>Parameter Description</th>
</thead>
<tbody>
<tr><td><i>dsrl</i></td><td><i>IRIFFElementDeserializer</i></td><td>The child deserializer.</td></tr>
</tbody>
</table>

### (Module) Errors

Following error classes are provided:

<table>
<thead>
<th>Name</th><th>Parent Class</th><th>Description</th>
</thead>
<tbody>
<tr><td><i>RIFFError</i></td><td><i>Error</i></td><td>RIFF error</td></tr>
<tr><td><i>RIFFBugError</i></td><td><i>Error</i></td><td>RIFF bug error</td></tr>
<tr><td><i>RIFFParameterError</i></td><td><i>Error</i></td><td>RIFF parameter error</td></tr>
<tr><td><i>RIFFInvalidOperationError</i></td><td><i>Error</i></td><td>RIFF invalid operation error</td></tr>
<tr><td><i>RIFFOperationCancelledError</i></td><td><i>Error</i></td><td>RIFF operation cancelled error</td></tr>
<tr><td><i>RIFFSerializeError</i></td><td><i>Error</i></td><td>RIFF serialize error</td></tr>
<tr><td><i>RIFFDeserializeError</i></td><td><i>Error</i></td><td>RIFF deserialize error</td></tr>
<tr><td><i>RIFFDeserializerExistedError</i></td><td><i>Error</i></td><td>RIFF deserializer existed error</td></tr>
<tr><td><i>RIFFDeserializerNotExistsError</i></td><td><i>Error</i></td><td>RIFF deserializer not exists error</td></tr>
<tr><td><i>RIFFIOError</i></td><td><i>Error</i></td><td>RIFF I/O error</td></tr>
</tbody>
</table>

